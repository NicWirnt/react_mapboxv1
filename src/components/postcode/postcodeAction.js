import { getPostcode } from "../../helper/axios";

export const fetchPostcodeData = (postcode) => async (dispatch) => {
  const response = await getPostcode(postcode);

  console.log(response);
};
