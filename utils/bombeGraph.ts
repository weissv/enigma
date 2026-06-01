/**
 * Turing Bombe Graph Generator
 * 
 * Generates the "Menu" graph used by the Bombe to find logical loops.
 * Nodes: Letters A-Z
 * Edges: Link between Plaintext character and Ciphertext character at relative position i.
 */

export interface MenuEdge {
  from: string;
  to: string;
  position: number;
}

export interface MenuGraph {
  nodes: string[];
  edges: MenuEdge[];
  loops: MenuEdge[][];
}

export function generateMenuGraph(ciphertext: string, crib: string, offset: number = 0): MenuGraph {
  const edges: MenuEdge[] = [];
  const nodesSet = new Set<string>();

  const minLen = Math.min(ciphertext.length - offset, crib.length);
  
  for (let i = 0; i < minLen; i++) {
    const p = crib[i].toUpperCase();
    const c = ciphertext[i + offset].toUpperCase();
    
    // Ignore non-alphabet
    if (p < 'A' || p > 'Z' || c < 'A' || c > 'Z') continue;
    
    // Enigma cannot map a letter to itself (if p === c, it's an impossible crib position, commonly called a "crash")
    // We still add the edge to show the contradiction or for general graphing
    edges.push({ from: p, to: c, position: i + offset });
    nodesSet.add(p);
    nodesSet.add(c);
  }

  // Find loops (simple DFS for cycle detection in undirected graph)
  // For simplicity, we just find small fundamental cycles up to length 6.
  const loops: MenuEdge[][] = [];
  const visited = new Set<string>();
  
  const adj = new Map<string, MenuEdge[]>();
  for (const n of nodesSet) adj.set(n, []);
  for (const e of edges) {
    adj.get(e.from)!.push(e);
    adj.get(e.to)!.push({ from: e.to, to: e.from, position: e.position }); // undirected
  }

  // Find loops (basic cycle detection, returning just the edges involved in one or more cycles for visualization)
  function dfs(current: string, parent: string, path: MenuEdge[]) {
    visited.add(current);
    
    for (const edge of adj.get(current)!) {
      if (edge.to === parent) continue; // Don't go immediately back
      
      if (visited.has(edge.to)) {
        // Cycle found
        // Extract the cycle from path
        const cycleEdges = [...path, edge];
        // Only keep if it's a real cycle (we can just add the whole path for visualization)
        loops.push(cycleEdges);
      } else {
        dfs(edge.to, current, [...path, edge]);
      }
    }
  }

  // Just run DFS from first node (not comprehensive, but good enough for a visual trace)
  if (nodesSet.size > 0) {
    const startNode = Array.from(nodesSet)[0];
    dfs(startNode, '', []);
  }

  return {
    nodes: Array.from(nodesSet),
    edges,
    loops
  };
}
