type CreateHatchPatternParams = {
  ctx: CanvasRenderingContext2D;
  devicePixelRatio: number;
  backgroundColor: string;
  lineColor: string;
  tileSize: number;
  lineWidth: number;
};

export const createHatchPattern = ({
  ctx,
  devicePixelRatio,
  backgroundColor,
  lineColor,
  tileSize,
  lineWidth,
}: CreateHatchPatternParams): CanvasPattern | null => {
  const tileCanvas = document.createElement('canvas');
  const tilePixelSize = Math.round(tileSize * devicePixelRatio);

  tileCanvas.width = tilePixelSize;
  tileCanvas.height = tilePixelSize;

  const tileContext = tileCanvas.getContext('2d');

  if (tileContext === null) {
    return null;
  }

  tileContext.scale(devicePixelRatio, devicePixelRatio);
  tileContext.fillStyle = backgroundColor;
  tileContext.fillRect(0, 0, tileSize, tileSize);

  tileContext.strokeStyle = lineColor;
  tileContext.lineWidth = lineWidth;
  tileContext.beginPath();

  // Three segments so the diagonal stripes join seamlessly across tiles.
  const half = tileSize / 2;

  tileContext.moveTo(0, tileSize);
  tileContext.lineTo(tileSize, 0);
  tileContext.moveTo(-half, half);
  tileContext.lineTo(half, -half);
  tileContext.moveTo(half, tileSize + half);
  tileContext.lineTo(tileSize + half, half);
  tileContext.stroke();

  const pattern = ctx.createPattern(tileCanvas, 'repeat');

  // The main context is already scaled by the device pixel ratio, so the
  // tile is scaled back down to keep stripes crisp on high-DPI screens.
  pattern?.setTransform(
    new DOMMatrix().scale(1 / devicePixelRatio, 1 / devicePixelRatio),
  );

  return pattern;
};
