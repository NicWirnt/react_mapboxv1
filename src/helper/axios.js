import axios from "axios";

const postcodeUrl = "https://greenways.vercel.app/api/data?postcode=";

const apiProcessor = async ({ method, url, dataObj }) => {
  try {
    const { data } = await axios({
      method,
      url,
      data: dataObj,
    });
    return data;
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
};

//GET API POSTCODE FROM GREENWAYS
export const getPostcode = async (postcode) => {
  const url = postcodeUrl + postcode;
  return apiProcessor({
    method: "get",
    url,
  });
};
