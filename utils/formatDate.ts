export const formatDate = (date: string) => {
  const formattedDate = new Date(date).toLocaleDateString("id-ID", {
    dateStyle: "medium",
  });
  return formattedDate;
};
