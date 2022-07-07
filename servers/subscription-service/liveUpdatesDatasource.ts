import GatewayDatasource from "../utils/gatewayDatasource";
import gql from "graphql-tag";

class LiveUpdatesDatasource extends GatewayDatasource {
  constructor(gatewayUrl) {
    super(gatewayUrl);
  }
  async fetchAndMergeNonPayloadPostData(bookId, payload, info) {
    const selections = this.buildNonPayloadSelections(payload, info);
    const payloadData = Object.values(payload)[0];

    if (!selections) {
      return payloadData;
    }

    const getBookSubscription = gql`
      query GET_BOOK($id: ID!) {
        book(id: $id) {
          ${selections}
        }
      }
    `;

    try {
      const response = await this.query(getBookSubscription, {
        // @ts-ignore
        variables: { id: bookId },
      });
      return this.mergeFieldData(payloadData, response.data.post);
    } catch (error) {
      console.error(error);
    }
  }
}

export default LiveUpdatesDatasource;
