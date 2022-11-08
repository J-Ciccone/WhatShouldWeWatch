export const getRandom = async (num) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "generateStrings",
      params: {
        apiKey: "bbebb273-9cfd-4c77-8d5a-9007f73a5cb8",
        n: 1,
        length: num,
        characters:
          "abcdefghijklmnpqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ123456789",
        replacement: true,
        pregeneratedRandomization: null,
      },
      id: 30084,
    }),
  };
  const query = await fetch(
    `https://api.random.org/json-rpc/4/invoke`,
    requestOptions
  ).then((res) => {
    return res.json();
  });
  return query.result.random.data[0];
};
