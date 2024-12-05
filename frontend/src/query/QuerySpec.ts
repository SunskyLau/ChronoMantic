// 查询规范
export type QuerySpec = {
  fragmentDescription: FragmentDescription[];
};

export type FragmentDescription = {
  trend: Trend | null;
};

export type Trend = {
  direction: Direction;
  degree: Degree;
};

export enum Direction {
  RISE = "rise",
  FALL = "fall",
  CONSTANT = "constant",
}

export enum Degree {
  SLIGHTLY = "slightly",
  MODERATELY = "moderately",
  SHARPLY = "sharply",
}

//EXAMPLE
// "a sharp fall and then a gradual recovery"
// convert to
// {
//   "fragmentDescription": [
//     {
//       "trend": {
//         "direction": "fall",
//         "degree": "sharply",
//       },
//     },
//     {
//       "trend": {
//         "direction": "rise",
//         "degree": "slightly",
//       },
//     },
//   ];
// }