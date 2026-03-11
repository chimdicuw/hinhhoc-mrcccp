
export interface ProblemInput {
  text?: string;
  image?: {
    mimeType: string;
    data: string; // base64
  };
}

export interface Parameter {
  name: string;
  min: number;
  max: number;
  defaultValue: number;
  step: number;
  description: string;
  updateFunction: string;
  dragConfig?: {
    elementId: string;
    constraint: {
      type: 'line-segment';
      p1: { x: number; y: number };
      p2: { x: number; y: number };
    } | {
      type: 'circle';
      center: { x: number; y: number };
      radius: number;
    };
  };
}

export interface GeometrySolution {
  given: string;
  conclusion: string;
  svgContent: string;
  parameters: Parameter[];
  steps: { part: string; explanation: string }[];
}
