
/**
 * Configuration file for Prisma when deploying to Vercel
 * This ensures the correct binary targets are generated for serverless deployments
 */
module.exports = {
  binaryTargets: ["native", "rhel-openssl-3.0.x"],
  // Output to a specific directory that Vercel can access
  outputClientEnvFile: true,
  outputClientPath: ".vercel/output/functions/_prisma-client",
};
