import TTLCache from "@isaacs/ttlcache";

console.log("initializing cache");
export const UPC_DATA_CACHE = new TTLCache({
    max: 1000,
})