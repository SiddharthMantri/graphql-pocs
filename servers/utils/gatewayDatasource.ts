import { DataSource, DataSourceConfig } from "apollo-datasource";
import fetch from "cross-fetch";
import { createHttpLink, execute, from, toPromise } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { DocumentNode } from "graphql";
import { GraphQLOptions } from "apollo-server-core";
import {
  FieldsByTypeName,
  parseResolveInfo,
  ResolveTree,
} from "graphql-parse-resolve-info";
import merge from "lodash/merge";

class GatewayDatasource<TContext = any> extends DataSource {
  private gatewayURL;
  context: TContext;

  constructor(gatewayURL: string) {
    super();
    this.gatewayURL = gatewayURL;
  }

  override initialize(config: DataSourceConfig<TContext>): void {
    this.context = config.context;
  }

  onRequestLink() {
    return setContext((request) => {
      if (typeof (this as any).willSendRequest === "function") {
        (this as any).willSendRequest(request);
      }
      return request;
    });
  }
  composeLinks() {
    return from([
      this.onRequestLink(),
      createHttpLink({
        fetch,
        uri: this.gatewayURL,
      }),
    ]);
  }

  async query(query: DocumentNode, options?: GraphQLOptions) {
    const link = this.composeLinks();
    try {
      const operation = {
        query,
        ...(options && options),
      };
      const response = await toPromise(execute(link, { query, ...options }));
      return response;
    } catch (error) {
      throw error;
    }
  }

  addDelimiter(a: string, b: string) {
    return a ? `${a}.${b}` : b;
  }
  isObject(val: any) {
    return typeof val === "object" && !Array.isArray(val) && val !== null;
  }
  isFieldObject(obj: any) {
    return (
      this.isObject(obj) &&
      obj.hasOwnProperty("args") &&
      obj.hasOwnProperty("alias") &&
      obj.hasOwnProperty("name")
    );
  }
  fieldPathsAsStrings(obj: { [key: string]: any }) {
    const paths = (obj = {}, head = ""): string[] => {
      return Object.entries(obj).reduce(
        (acc: string[], [key, value]: [string, any]) => {
          let fullPath = this.addDelimiter(head, key);
          return this.isObject(value)
            ? acc.concat(key, paths(value, fullPath))
            : acc.concat(fullPath);
        },
        []
      );
    };
    return paths(obj);
  }
  fieldPathsAsMapFromResolveInfo(resolveInfo: FieldsByTypeName | ResolveTree) {
    // Construct entries-like array of field paths their corresponding name, alias, and args
    const paths = (obj = {}, head = ""): [string, any][] => {
      return Object.entries(obj).reduce(
        (acc: [string, any][], [key, value]: [string, any]) => {
          let fullPath = this.addDelimiter(head, key);
          if (
            this.isFieldObject(value) &&
            Object.keys(value.fieldsByTypeName).length === 0
          ) {
            const { alias, args, name } = value;
            return acc.concat([[fullPath, { alias, args, name }]]);
          } else if (this.isFieldObject(value)) {
            const { alias, args, name } = value;
            return acc.concat(
              [[fullPath, { alias, args, name }]],
              paths(value, fullPath)
            );
          } else if (this.isObject(value)) {
            return acc.concat(paths(value, fullPath));
          }
          return acc.concat([[fullPath, null]]);
        },
        []
      );
    };
    const resolveInfoFields = paths(resolveInfo);
    // Filter field paths and construct an object from entries
    return Object.fromEntries(
      resolveInfoFields
        .filter(([_, options]) => options)
        .map(([path, { alias, args, name }]) => {
          const pathParts = path.split(".");
          const noTypeNames = pathParts.forEach((part, i) => {
            if (pathParts[i - 1] === "fieldsByTypeName") {
              pathParts.splice(i - 1, 2);
            }
          });
          let keptOptions = {
            ...(name !== alias && { alias }),
            ...(Object.keys(args).length && { args }),
          };
          return [
            pathParts.join("."),
            Object.keys(keptOptions).length ? keptOptions : null,
          ];
        })
    );
  }
  buildSelection(selection, pathString, pathParts, fieldPathMap, index) {
    let formattedSelection = selection;
    let options;
    let parentOptions;
    if (pathParts.length > 1 && index < pathParts.length - 1) {
      const parentPathString = pathParts.slice(0, index + 1).join(".");
      parentOptions = fieldPathMap[parentPathString];
    } else {
      options = fieldPathMap[pathString];
    }
    if (parentOptions) {
      if (parentOptions.alias) {
        formattedSelection = `${parentOptions.alias}: ${formattedSelection}`;
      }
      if (parentOptions.args) {
        // Stringify object, remove outer brackets, then remove double quotes before colon
        const formattedArgs = JSON.stringify(parentOptions.args)
          .slice(1, -1)
          .replace(/"([^"]+)":/g, "$1:");
        formattedSelection = `${formattedSelection}(${formattedArgs})`;
      }
    } else if (options) {
      if (options.alias) {
        formattedSelection = `${options.alias}: ${formattedSelection}`;
      }
      if (options.args) {
        const formattedArgs = JSON.stringify(options.args)
          .slice(1, -1)
          .replace(/"([^"]+)":/g, "$1:");
        formattedSelection = `${formattedSelection}(${formattedArgs})`;
      }
    }
    return formattedSelection;
  }
  // This function checks the fields that were included in the payload against
  // the fields that were requested in the subscription operation from the
  // client and then builds up a string of field selections to fetch on the
  // subscription return type from the gateway to supplement the payload data and
  // in order to fully resolve the operation
  buildNonPayloadSelections(payload, info) {
    const resolveInfo = parseResolveInfo(info);
    const payloadFieldPaths = this.fieldPathsAsStrings(
      payload[resolveInfo?.name as string]
    );
    const operationFields = resolveInfo
      ? this.fieldPathsAsMapFromResolveInfo(resolveInfo)
      : {};
    const operationFieldPaths = Object.keys(operationFields);
    return operationFieldPaths
      .filter((path) => !payloadFieldPaths.includes(path))
      .reduce((acc, curr, i, arr) => {
        const pathParts = curr.split(".");
        let selections = "";
        pathParts.forEach((part, j) => {
          // Is this a top-level field that will be accounted for when nested
          // children are added to the selection?
          const hasSubFields = !!arr.slice(i + 1).find((item) => {
            const itemParts = item.split(".");
            itemParts.pop();
            const rejoinedItem = itemParts.join(".");
            return rejoinedItem === curr;
          });
          if (hasSubFields) {
            return;
          }
          const sel = this.buildSelection(
            part,
            curr,
            pathParts,
            operationFields,
            j
          );
          if (j === 0) {
            selections = `${sel} `;
          } else if (j === 1) {
            selections = `${selections}{ ${sel} } `;
          } else {
            const char = -(j - 2) - j;
            selections = `${selections.slice(
              0,
              char
            )}{ ${sel} } ${selections.slice(char)}`;
          }
        });
        return acc + selections;
      }, "");
  }
  // Deep merges the values of payload fields with non-payload fields to
  // compose the overall response from the subscription field resolver
  mergeFieldData(payloadFieldData, nonPayloadFieldData) {
    return merge(payloadFieldData, nonPayloadFieldData);
  }
}

export default GatewayDatasource;
