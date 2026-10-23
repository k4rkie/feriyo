import "dotenv/config";
import httpServer from "./app.js";
import { expireOffers } from "./services/offer.services.js";

const PORT = process.env.PORT ?? 8000;

httpServer.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);

  void expireOffers().catch((error) => {
    console.error("Failed to expire stale offers", error);
  });

  setInterval(() => {
    void expireOffers().catch((error) => {
      console.error("Failed to expire stale offers", error);
    });
  }, 60_000).unref();
});
