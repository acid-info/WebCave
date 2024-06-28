const main = async () => {
  console.log("Hello World!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});