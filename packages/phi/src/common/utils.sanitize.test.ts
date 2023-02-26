import { sanitizeAddress } from "./util.js";

describe(`Address sanitization`, () => {
  test("Should noop on full cashaddr format", async () => {
    let v = "bitcoincash:qqqy9c5c8djjxcpg9uzy87h6junkpt6sw56vuw5jmm";
    expect(await sanitizeAddress(v)).toBe(
      "bitcoincash:qqqy9c5c8djjxcpg9uzy87h6junkpt6sw56vuw5jmm"
    );
  });

  test("Should noop on capitalized full cashaddr format", async () => {
    let v =
      "bitcoincash:qqqy9c5c8djjxcpg9uzy87h6junkpt6sw56vuw5jmm".toUpperCase();
    expect(await sanitizeAddress(v)).toBe(
      "bitcoincash:qqqy9c5c8djjxcpg9uzy87h6junkpt6sw56vuw5jmm"
    );
  });

  test("Should sanitize prefix-less mainnet p2pkh format", async () => {
    let v = "qqqy9c5c8djjxcpg9uzy87h6junkpt6sw56vuw5jmm";
    expect(await sanitizeAddress(v)).toBe(
      "bitcoincash:qqqy9c5c8djjxcpg9uzy87h6junkpt6sw56vuw5jmm"
    );
  });

  test("Should sanitize prefix-less regtest p2sh format", async () => {
    let v = "qpttdv3qg2usm4nm7talhxhl05mlhms3ys43u76rn0";
    expect(await sanitizeAddress(v)).toBe(
      "bchreg:qpttdv3qg2usm4nm7talhxhl05mlhms3ys43u76rn0"
    );
  });

  test("Should sanitize 32 byte prefix-less p2sh format", async () => {
    let v = "pwyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygsh3sujgcr";
    expect(await sanitizeAddress(v)).toBe(
      "bitcoincash:pwyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygsh3sujgcr"
    );
  });

  test("Should sanitize 40 byte prefix-less p2sh format", async () => {
    let v =
      "qh3krj5607v3qlqh5c3wq3lrw3wnuxw0sp8dv0zugrrt5a3kj6ucysfz8kxwv2k53krr7n933jfsunqex2w82sl";
    expect(await sanitizeAddress(v)).toBe(
      "bitcoincash:qh3krj5607v3qlqh5c3wq3lrw3wnuxw0sp8dv0zugrrt5a3kj6ucysfz8kxwv2k53krr7n933jfsunqex2w82sl"
    );
  });

  test("Should sanitize 64 byte prefixed p2sh format", async () => {
    let v =
      "pref:plg0x333p4238k0qrc5ej7rzfw5g8e4a4r6vvzyrcy8j3s5k0en7calvclhw46hudk5flttj6ydvjc0pv3nchp52amk97tqa5zygg96mg7pj3lh8";
    expect(await sanitizeAddress(v)).toBe(
      "pref:plg0x333p4238k0qrc5ej7rzfw5g8e4a4r6vvzyrcy8j3s5k0en7calvclhw46hudk5flttj6ydvjc0pv3nchp52amk97tqa5zygg96mg7pj3lh8"
    );
  });

  test("Should sanitize prefix-less p2sh format", async () => {
    let v = "pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr";
    expect(await sanitizeAddress(v)).toBe(
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr"
    );
  });

  test("Should sanitize prefix-less testnet p2sh format", async () => {
    let v = "pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwu2n8uh89l";
    expect(await sanitizeAddress(v)).toBe(
      "bchtest:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwu2n8uh89l"
    );
  });

  test("Should sanitize prefix-less testnet p2pkh format", async () => {
    let v = "qqq4z5f7esknjlq3rmrgasd0dpez2exrzceytksazk";
    expect(await sanitizeAddress(v)).toBe(
      "bchtest:qqq4z5f7esknjlq3rmrgasd0dpez2exrzceytksazk"
    );
  });

  test("Should sanitize legacy P2PKH format", async () => {
    let v = "112P8G7vPH5ifBjka5irr4zJgUUKdaK5hi";
    expect(await sanitizeAddress(v)).toBe(
      "bitcoincash:qqqy9c5c8djjxcpg9uzy87h6junkpt6sw56vuw5jmm"
    );
  });

  test("Should sanitize legacy P2PKH format", async () => {
    let v = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
    expect(await sanitizeAddress(v)).toBe(
      "bitcoincash:qp3wjpa3tjlj042z2wv7hahsldgwhwy0rq9sywjpyy"
    );
  });

  test("Should sanitize legacy P2PKH format (Internet Archive)", async () => {
    let v = "1Archive1n2C579dMsAu3iC6tWzuQJz8dN";
    expect(await sanitizeAddress(v)).toBe(
      "bitcoincash:qpkpk5g6vvcxkc55u8fnjzkge4yp7anst5l36nlyg6"
    );
  });

  test("Should sanitize legacy compressed Base58 P2PKH format", async () => {
    let v = "1BzHQQrSFbqgKWyyKL1HbaHxSGZpRE8dSF"; //compressed
    expect(await sanitizeAddress(v)).toBe(
      "bitcoincash:qpugd2f954uhk9d9x3mzpl07gmu9nerwhg6c6dtmfp"
    );
  });

  test("Should a error on legacy P2SH format", async () => {
    try {
      let v = "3N5i3Vs9UMyjYbBCFNQqU3ybSuDepX7oT3";
      await sanitizeAddress(v);
    } catch (e) {
      expect(e).toEqual(
        Error(
          "Refusing to convert a legacy P2SH address (possibly segwit) to cashaddress"
        )
      );
    }
  });

  test("Should throw on legacy P2SH testnet format", async () => {
    try {
      let v = "2NESaJWDZ2VvZfrPrx3spq8qdgGkkE4uZtY";
      await sanitizeAddress(v);
    } catch (e) {
      expect(e).toEqual(
        Error(
          "Refusing to convert a legacy P2SH address (possibly segwit) to cashaddress"
        )
      );
    }
  });

  test("Should throw on segwit addresses format", async () => {
    expect.assertions(4);
    // Mainnet P2WPKH: bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4
    // Testnet P2WPKH: tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx
    // Mainnet P2WSH: bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3
    // Testnet P2WSH: tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7
    let vectors = [
      "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
      "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
      "bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3",
      "tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7",
    ];
    for (let v of vectors) {
      try {
        await sanitizeAddress(v);
      } catch (e) {
        expect(e).toEqual(
          Error("Refusing to convert segwit P2SH address to cashaddress")
        );
      }
    }
  });
});
