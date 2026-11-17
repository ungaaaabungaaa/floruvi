import test from "node:test";
import assert from "node:assert/strict";
import { getImageProps } from "next/image";
import { publicImage } from "../lib/public-images";

test("public images retain direct URLs and dimensions without image transforms", () => {
  const prior = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL = "https://media.example.com/";
  try {
    const image = publicImage("flourvi/test image.webp", 640, 480);
    assert.deepEqual(image, {
      src: "https://media.example.com/flourvi/test%20image.webp", width: 640, height: 480,
    });
    const { props } = getImageProps({ src: image, alt: "Test", unoptimized: true });
    assert.equal(props.src, image.src);
    assert.equal(props.width, 640);
    assert.equal(props.height, 480);
    assert.equal(props.srcSet, undefined);
    for (const key of ["other/image.webp", "flourvi/../image.webp", "flourvi//image.webp", "flourvi/image?token=x"])
      assert.throws(() => publicImage(key, 640, 480));
    assert.throws(() => publicImage("flourvi/image.webp", 0, 480));
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL = "https://media.example.com/?token=x";
    assert.throws(() => publicImage("flourvi/image.webp", 640, 480));
    delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
    assert.throws(() => publicImage("flourvi/image.webp", 640, 480));
  } finally {
    if (prior === undefined) delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
    else process.env.NEXT_PUBLIC_MEDIA_BASE_URL = prior;
  }
});
