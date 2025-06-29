export async function getTokenForHeaderAuthorization(Authorization: string) {
  const token = Authorization.split(" ")[1];
  return token;
}