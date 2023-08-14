import axios from "axios";

const apiUrl = "http://localhost/mapbox_backend/";

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
  const url = apiUrl + `postcode?q=${postcode}`;
  return apiProcessor({
    method: "get",
    url,
  });
};
