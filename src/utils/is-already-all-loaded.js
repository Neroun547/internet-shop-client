export function isAlreadyAllLoaded(apiResponse, takeOption) {
  if (apiResponse && Array.isArray(apiResponse.data) && apiResponse.data.length < takeOption) {
    return true;
  }
  if(!apiResponse || !Array.isArray(apiResponse.data)) {
    return true;
  }
  return false;
}

