export const formatUnixTimestamp = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };
  