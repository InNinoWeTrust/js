import { describe, expect, it } from "vitest";
import { createThirdwebClient } from "../client/client.js";
import {
  findIPFSCidFromUri,
  getBaseUriFromBatch,
  resolveScheme,
} from "./ipfs.js";

describe("resolveScheme", () => {
  it("should resolve ipfs scheme when not passing a gateway override", () => {
    const client = createThirdwebClient({
      clientId: "test",
    });
    const uri = "ipfs://Qm...";
    const url = resolveScheme({ client, uri });
    expect(url).toMatchInlineSnapshot(`"https://test.ipfscdn.io/ipfs/Qm..."`);
  });

  it("should resolve ipfs scheme", () => {
    const client = createThirdwebClient({
      clientId: "test",
    });
    const uri =
      "ipfs://bafkreidi5y7afj5z4xrz7uz5rkg2mcsv2p2n4ui4g7q4k4ecdz65i2agou";
    const url = resolveScheme({ client, uri });
    expect(url).toMatchInlineSnapshot(
      `"https://test.ipfscdn.io/ipfs/bafkreidi5y7afj5z4xrz7uz5rkg2mcsv2p2n4ui4g7q4k4ecdz65i2agou"`,
    );
  });

  it("should resolve ipfs scheme when passing a gateway override", () => {
    const client = createThirdwebClient({
      clientId: "test",
      config: {
        storage: {
          gatewayUrl: "https://gateway.io/ipfs/{cid}",
        },
      },
    });
    const uri = "ipfs://Qm...";
    const url = resolveScheme({ client, uri });
    expect(url).toMatchInlineSnapshot(`"https://gateway.io/ipfs/Qm..."`);
  });

  it("should resolve http(s) scheme", () => {
    const client = createThirdwebClient({
      clientId: "test",
    });
    const uri = "https://example.com/file.txt";
    const url = resolveScheme({ client, uri });
    expect(url).toBe(uri);
  });

  it("should throw for an invalid uri scheme", () => {
    const client = createThirdwebClient({
      clientId: "test",
    });
    const uri = "invalid://Qm...";
    expect(() =>
      resolveScheme({ client, uri }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid URI scheme, expected "ipfs://" or "http(s)://"]`,
    );
  });

  it("should return the uri un-altered if it's not a valid ipfs uri", () => {
    const uri = "https://...";
    expect(findIPFSCidFromUri(uri)).toBe(uri);
  });

  it("should return the CID from a valid IPFS uri", () => {
    const cid = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
    const uri = `ipfs://${cid}`;
    expect(findIPFSCidFromUri(uri)).toBe(cid);
  });
});

describe("getBaseUriFromBatch", () => {
  it("should return the base uri", () => {
    const batchOfUris = ["ipfs://Qm.../0", "ipfs://Qm.../1", "ipfs://Qm.../2"];
    const baseUri = getBaseUriFromBatch(batchOfUris);
    expect(baseUri).toMatchInlineSnapshot(`"ipfs://Qm.../"`);
  });
  it("should throw if the batch is empty", () => {
    expect(() => getBaseUriFromBatch([])).toThrowErrorMatchingInlineSnapshot(
      "[Error: Batch of URIs is empty]",
    );
  });

  it("should throw if an element of the array does not have the same base", () => {
    const batchOfUris = ["ipfs://Qm.../0", "ipfs://Qm.../1", "ipfs://Qm2.../2"];
    expect(() =>
      getBaseUriFromBatch(batchOfUris),
    ).toThrowErrorMatchingInlineSnapshot(
      "[Error: All URIs in the batch must have the same base URI]",
    );
  });

  it("should work with a custom domain", () => {
    const batchOfUris = [
      "https://example.com/0",
      "https://example.com/1",
      "https://example.com/2",
    ];
    const baseUri = getBaseUriFromBatch(batchOfUris);
    expect(baseUri).toMatchInlineSnapshot(`"https://example.com/"`);
  });

  it("should work with a custom domain and path", () => {
    const batchOfUris = [
      "https://example.com/path/0",
      "https://example.com/path/1",
      "https://example.com/path/2",
    ];
    const baseUri = getBaseUriFromBatch(batchOfUris);
    expect(baseUri).toMatchInlineSnapshot(`"https://example.com/path/"`);
  });

  it("should work with a custom domain and path with trailing slash", () => {
    const batchOfUris = [
      "https://example.com/path/0/",
      "https://example.com/path/1/",
      "https://example.com/path/2/",
    ];
    const baseUri = getBaseUriFromBatch(batchOfUris);
    expect(baseUri).toMatchInlineSnapshot(`"https://example.com/path/"`);
  });
});
