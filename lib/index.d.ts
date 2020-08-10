declare type Point = {
    x: number;
    y: number;
};
declare type Contour = Point[];
/**
 * Removes holes from polygon by merging them with non-hole.
 */
export declare function removeHoles(polygon: Contour, holes: Contour[], doNotCheckOrdering?: boolean): Contour;
/**
 * Triangulation by ear clipping.
 */
export declare function triangulate(polygon: Contour, doNotCheckOrdering?: boolean): Contour[];
/**
 * Convex partition using Hertel-Mehlhorn algorithm.
 */
export declare function convexPartition(polygon: Contour, doNotCheckOrdering?: boolean): Contour[];
export {};
