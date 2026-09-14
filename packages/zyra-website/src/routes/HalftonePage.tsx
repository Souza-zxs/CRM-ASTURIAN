import { HalftoneStudioMount } from '@/platform/visuals/halftone-studio/studio/HalftoneStudioMount';

// Internal dev tool: noindex via the route registry record (indexed: false
// on the "halftone" static route, read by getRobotsDisallowedRoutePaths).
const HalftonePage = () => <HalftoneStudioMount />;

export default HalftonePage;
