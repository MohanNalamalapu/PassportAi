const MEDIAPIPE_BASE = "/mediapipe";

const FACE_MESH_SCRIPT = `${MEDIAPIPE_BASE}/face_mesh/face_mesh.js`;

let loadPromise: Promise<unknown> | null = null;
let faceMeshInstance: MediaPipeFaceMesh | null = null;
let faceMeshInitPromise: Promise<MediaPipeFaceMesh> | null = null;

type MediaPipeFaceMesh = {
  setOptions: (options: Record<string, unknown>) => void;
  initialize: () => Promise<void>;
  onResults: (listener: (results: FaceMeshResults) => void) => void;
  send: (inputs: { image: HTMLImageElement }) => Promise<void>;
};

export type FaceMeshResults = {
  multiFaceLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("MediaPipe can only load in the browser."));
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[data-mediapipe-src="${src}"]`);

    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.mediapipeSrc = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => {
      reject(
        new Error(
          `Failed to load MediaPipe script from ${src}. Run "npm run prepare:mediapipe" and restart the dev server.`
        )
      );
    };
    document.head.appendChild(script);
  });
}

/**
 * Loads Face Mesh only. Using a single MediaPipe WASM module avoids
 * Module.arguments conflicts between face_detection and face_mesh.
 */
export async function ensureMediaPipeLoaded(): Promise<unknown> {
  if (!loadPromise) {
    loadPromise = (async () => {
      await loadScript(FACE_MESH_SCRIPT);

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const windowGlobal = window as any;
      /* eslint-enable @typescript-eslint/no-explicit-any */

      if (typeof windowGlobal.FaceMesh !== "function") {
        throw new Error(
          "MediaPipe FaceMesh was not registered after loading local scripts. Restart the dev server and try again."
        );
      }

      return windowGlobal.FaceMesh;
    })();
  }

  return loadPromise;
}

export function getMediaPipeAssetBase(solution: "face_mesh"): string {
  return `${MEDIAPIPE_BASE}/${solution}`;
}

/**
 * Returns a singleton FaceMesh instance (WASM initialized once per page).
 */
export async function getFaceMeshInstance(): Promise<MediaPipeFaceMesh> {
  if (!faceMeshInitPromise) {
    faceMeshInitPromise = (async () => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const FaceMeshCtor = (await ensureMediaPipeLoaded()) as any;
      /* eslint-enable @typescript-eslint/no-explicit-any */

      const mesh: MediaPipeFaceMesh = new FaceMeshCtor({
        locateFile: (file: string) => `${getMediaPipeAssetBase("face_mesh")}/${file}`
      });

      mesh.setOptions({
        maxNumFaces: 2,
        refineLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });

      await mesh.initialize();
      faceMeshInstance = mesh;
      return mesh;
    })();
  }

  return faceMeshInitPromise;
}

export async function runFaceMesh(image: HTMLImageElement): Promise<FaceMeshResults> {
  const faceMesh = faceMeshInstance ?? (await getFaceMeshInstance());

  return new Promise<FaceMeshResults>((resolve, reject) => {
    faceMesh.onResults((results) => resolve(results));
    faceMesh.send({ image }).catch(reject);
  });
}
