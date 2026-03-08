// Track SVG coordinate data for F1 circuits
// Coordinates are normalized to fit within a 800x600 viewport

export interface TrackCoordinates {
  name: string;
  circuit: string;
  path: Array<[number, number]>; // [x, y] coordinate pairs
  sector1End: number; // % of track distance where sector 1 ends
  sector2End: number; // % of track distance where sector 2 ends
  pitLaneEntry: number; // % of track distance for pit entry
  pitLaneExit: number; // % of track distance for pit exit
  startFinishLine: [number, number]; // [x, y] coordinates
  direction: 'clockwise' | 'counterclockwise';
  viewBox: [number, number, number, number]; // [x, y, width, height]
}

export const TRACK_COORDINATES: Record<string, TrackCoordinates> = {
  bahrain: {
    name: 'Bahrain International Circuit',
    circuit: 'Sakhir',
    direction: 'clockwise',
    viewBox: [0, 0, 800, 600],
    startFinishLine: [400, 300],
    sector1End: 30,
    sector2End: 65,
    pitLaneEntry: 85,
    pitLaneExit: 5,
    path: [
      // Start/Finish straight
      [400, 300], [450, 300], [500, 300], [550, 300], [600, 300],
      // Turn 1 (right)
      [620, 310], [635, 325], [640, 345], [635, 365], [620, 380],
      // Back straight
      [600, 390], [550, 390], [500, 390], [450, 390], [400, 390],
      [350, 390], [300, 390], [250, 390],
      // Sector 1 end - Turn 4 complex
      [220, 400], [200, 420], [190, 450], [200, 480], [220, 500],
      [250, 510], [280, 500], [300, 480], [280, 460], [250, 450],
      // Long back straight sector 2
      [220, 440], [190, 430], [160, 420], [130, 410], [100, 400],
      [80, 380], [75, 350], [80, 320], [100, 300], [130, 290],
      // Sector 2 end - final turns
      [160, 280], [190, 270], [220, 260], [250, 250], [280, 240],
      [310, 230], [340, 225], [370, 230], [390, 250], [395, 280],
      // Return to start
      [400, 300],
    ],
  },

  monaco: {
    name: 'Circuit de Monaco',
    circuit: 'Monaco',
    direction: 'clockwise',
    viewBox: [0, 0, 800, 600],
    startFinishLine: [400, 500],
    sector1End: 25,
    sector2End: 60,
    pitLaneEntry: 95,
    pitLaneExit: 2,
    path: [
      // Start/Finish - Casino Square
      [400, 500], [420, 480], [440, 460], [460, 440], [480, 420],
      // Massenet/Casino curves
      [500, 400], [520, 380], [540, 360], [560, 340], [580, 320],
      // Downhill to Mirabeau
      [600, 300], [620, 280], [640, 260], [660, 240], [680, 220],
      [700, 200], [720, 180],
      // Sector 1 end - Mirabeau hairpin
      [730, 160], [735, 140], [730, 120], [720, 110], [700, 105],
      [680, 110], [660, 120], [640, 130], [620, 140],
      // Portier corner and tunnel
      [600, 150], [580, 160], [560, 170], [540, 180], [520, 190],
      [500, 200], [480, 210], [460, 220], [440, 230],
      // Chicane entry
      [420, 240], [400, 250], [380, 260], [360, 270], [340, 280],
      // Sector 2 end - Tabac corner
      [320, 290], [300, 300], [280, 310], [260, 320], [240, 330],
      [220, 340], [200, 350], [180, 360], [160, 370],
      // Swimming pool complex
      [140, 380], [125, 395], [120, 415], [125, 435], [140, 450],
      [160, 460], [180, 450], [200, 440], [220, 450], [240, 460],
      // La Rascasse
      [260, 470], [280, 480], [300, 490], [320, 495], [340, 490],
      [360, 485], [380, 490], [400, 495],
      // Return to start
      [400, 500],
    ],
  },

  monza: {
    name: 'Autodromo Nazionale di Monza',
    circuit: 'Monza',
    direction: 'clockwise',
    viewBox: [0, 0, 800, 600],
    startFinishLine: [400, 500],
    sector1End: 35,
    sector2End: 70,
    pitLaneEntry: 92,
    pitLaneExit: 8,
    path: [
      // Start/Finish straight
      [400, 500], [400, 480], [400, 460], [400, 440], [400, 420],
      [400, 400], [400, 380], [400, 360], [400, 340], [400, 320],
      // Turn 1 - Prima Variante (first chicane)
      [400, 300], [420, 290], [440, 285], [460, 290], [475, 300],
      [470, 315], [455, 325], [435, 330], [415, 325], [400, 310],
      [405, 295], [420, 285], [440, 285],
      // Curva Grande (high speed right)
      [460, 290], [480, 295], [500, 300], [520, 305], [540, 310],
      [560, 315], [580, 320], [600, 325], [620, 330], [640, 335],
      // Sector 1 end - Curve di Lesmo
      [660, 340], [675, 350], [680, 365], [675, 380], [660, 390],
      [640, 395], [620, 390], [605, 375], [600, 355], [610, 340],
      // Lesmo 2
      [620, 330], [640, 325], [660, 320], [675, 325], [685, 340],
      [680, 355], [670, 365], [655, 370], [640, 365], [630, 350],
      // Back straight
      [650, 340], [670, 340], [690, 340], [710, 340], [730, 340],
      [750, 340], [770, 340],
      // Sector 2 end - Ascari chicane complex
      [780, 350], [785, 365], [780, 380], [770, 390], [755, 395],
      [740, 390], [730, 380], [735, 365], [750, 355], [765, 360],
      [775, 370], [770, 385], [755, 395], [740, 400], [725, 395],
      [715, 385], [720, 370], [735, 360],
      // Curva Parabolica
      [720, 370], [700, 380], [680, 390], [660, 400], [640, 410],
      [620, 420], [600, 430], [580, 440], [560, 450], [540, 460],
      [520, 470], [500, 480], [480, 490], [460, 495], [440, 490],
      [425, 485], [410, 490], [400, 495],
      // Return to start
      [400, 500],
    ],
  },

  silverstone: {
    name: 'Silverstone Circuit',
    circuit: 'Silverstone',
    direction: 'clockwise',
    viewBox: [0, 0, 800, 600],
    startFinishLine: [200, 300],
    sector1End: 30,
    sector2End: 65,
    pitLaneEntry: 88,
    pitLaneExit: 12,
    path: [
      // Start/Finish and Wellington straight
      [200, 300], [230, 300], [260, 300], [290, 300], [320, 300],
      [350, 300], [380, 300], [410, 300],
      // Turn 1 - Abbey
      [430, 290], [445, 275], [450, 255], [445, 235], [430, 220],
      [410, 215], [390, 220], [375, 235], [370, 255], [375, 275],
      [390, 290], [410, 295],
      // Farm Curve complex
      [430, 285], [450, 270], [470, 250], [490, 230], [510, 210],
      [530, 190], [550, 175], [570, 165], [590, 160], [610, 165],
      // Sector 1 end - Village/Loop section
      [630, 175], [645, 190], [650, 210], [645, 230], [630, 245],
      [610, 250], [590, 245], [575, 230], [570, 210], [575, 190],
      [590, 175], [610, 170], [630, 175],
      // Vale/Club chicane
      [650, 180], [665, 195], [670, 215], [665, 235], [650, 250],
      [630, 255], [610, 250], [595, 235], [590, 215], [595, 195],
      // Sector 2 end - Stowe corner
      [610, 180], [630, 175], [650, 170], [670, 165], [690, 160],
      [705, 150], [710, 135], [705, 120], [690, 110], [670, 105],
      [650, 110], [630, 120], [615, 135], [610, 150],
      // Vale complex
      [620, 165], [635, 180], [645, 200], [650, 220], [645, 240],
      [630, 255], [610, 260], [590, 255], [575, 240], [570, 220],
      [575, 200], [590, 185], [610, 180],
      // Final sector - Luffield/Woodcote
      [590, 185], [570, 190], [550, 200], [530, 215], [510, 235],
      [490, 255], [470, 275], [450, 295], [430, 310], [410, 320],
      [390, 315], [370, 305], [350, 295], [330, 290], [310, 295],
      [290, 305], [270, 310], [250, 305], [230, 295], [210, 290],
      // Return to start
      [200, 300],
    ],
  },
};

// Helper function to get track by circuit name
export function getTrackByName(name: string): TrackCoordinates | undefined {
  const key = Object.keys(TRACK_COORDINATES).find(
    key => TRACK_COORDINATES[key].circuit.toLowerCase() === name.toLowerCase()
  );
  return key ? TRACK_COORDINATES[key] : undefined;
}

// Helper function to convert track coordinates to SVG path string
export function coordinatesToSVGPath(coordinates: Array<[number, number]>): string {
  if (coordinates.length === 0) return '';
  
  const [firstX, firstY] = coordinates[0];
  let path = `M ${firstX} ${firstY}`;
  
  for (let i = 1; i < coordinates.length; i++) {
    const [x, y] = coordinates[i];
    path += ` L ${x} ${y}`;
  }
  
  // Close the path
  path += ' Z';
  return path;
}

// Helper function to calculate track position percentage from coordinates
export function calculateTrackPosition(
  coordinates: Array<[number, number]>,
  targetX: number,
  targetY: number
): number {
  let closestIndex = 0;
  let minDistance = Infinity;
  
  // Find the closest coordinate point
  coordinates.forEach((coord, index) => {
    const [x, y] = coord;
    const distance = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });
  
  // Return percentage of track completion
  return (closestIndex / (coordinates.length - 1)) * 100;
}

// Helper function to get coordinates at a specific track percentage
export function getCoordinatesAtPosition(
  coordinates: Array<[number, number]>,
  percentage: number
): [number, number] | null {
  if (percentage < 0 || percentage > 100) return null;
  
  const index = Math.floor((percentage / 100) * (coordinates.length - 1));
  return coordinates[Math.min(index, coordinates.length - 1)];
}

// Get all available track names
export function getAvailableTracks(): string[] {
  return Object.keys(TRACK_COORDINATES);
}