import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { TrapezoidalPrismDimensions, VisualStyle } from '../../app/components/standalone/trapezoidal-prism/types';

interface TrapezoidalPrismProps {
  dimensions: TrapezoidalPrismDimensions;
  isUnfolded?: boolean;
  visualStyle: VisualStyle;
}

const TrapezoidalPrism: React.FC<TrapezoidalPrismProps> = ({ 
  dimensions, 
  isUnfolded = false,
  visualStyle = 'solid'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const labelRendererRef = useRef<CSS2DRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const meshRef = useRef<THREE.Mesh | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const labelsGroupRef = useRef<THREE.Group | null>(null);
    const _edgesRef = useRef<THREE.LineSegments | null>(null);

    useEffect(() => {
        const currentContainer = containerRef.current;
        const currentLabelsGroup = labelsGroupRef.current;
        if (!currentContainer) return;

        const webGLRenderer = new THREE.WebGLRenderer({ antialias: true });
        const css2DRenderer = new CSS2DRenderer();
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            75,
            currentContainer.clientWidth / currentContainer.clientHeight,
            0.1,
            1000
        );
        camera.position.set(5, 5, 4);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        webGLRenderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight);
        currentContainer.appendChild(webGLRenderer.domElement);
        rendererRef.current = webGLRenderer;

        css2DRenderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight);
        css2DRenderer.domElement.style.position = 'absolute';
        css2DRenderer.domElement.style.top = '0';
        css2DRenderer.domElement.style.pointerEvents = 'none';
        currentContainer.appendChild(css2DRenderer.domElement);
        labelRendererRef.current = css2DRenderer;

        const orbitControls = new OrbitControls(camera, webGLRenderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.minPolarAngle = Math.PI / 6;
        orbitControls.maxPolarAngle = Math.PI * 0.8;
        orbitControls.minDistance = 3;
        orbitControls.maxDistance = 10;
        controlsRef.current = orbitControls;

        // Improved lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        // Main directional light with adjusted intensity
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        // Add a second directional light from another angle for better edge definition
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight2.position.set(-5, 3, -10);
        scene.add(directionalLight2);

        const prismGeometry = createTrapezoidalPrismGeometry(dimensions, isUnfolded);
        
        // Create the mesh with appropriate material based on visualStyle
        const mesh = createPrismMesh(prismGeometry, visualStyle, isUnfolded);
        scene.add(mesh);
        meshRef.current = mesh;

        const labelsGroup = new THREE.Group();
        scene.add(labelsGroup);
        labelsGroupRef.current = labelsGroup;
        
        updateLabels(dimensions, scene, mesh, isUnfolded);

        const animate = () => {
            requestAnimationFrame(animate);
            orbitControls.update();
            webGLRenderer.render(scene, camera);
            css2DRenderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!currentContainer) return;
            const width = currentContainer.clientWidth;
            const height = currentContainer.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            webGLRenderer.setSize(width, height);
            css2DRenderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            webGLRenderer.dispose();
            css2DRenderer.domElement.remove();
            
            if (currentContainer) {
                currentContainer.removeChild(webGLRenderer.domElement);
            }

            if (currentLabelsGroup) {
                currentLabelsGroup.children.forEach(child => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        if (child.material instanceof THREE.Material) {
                            child.material.dispose();
                        }
                    }
                    if (child instanceof CSS2DObject) {
                        child.element.remove();
                    }
                });
            }
        };
    }, [dimensions, isUnfolded, visualStyle]);

    useEffect(() => {
        if (!meshRef.current || !sceneRef.current) return;
        
        const newGeometry = createTrapezoidalPrismGeometry(dimensions, isUnfolded);
        
        // Remove the old mesh
        if (sceneRef.current && meshRef.current) {
            sceneRef.current.remove(meshRef.current);
            if (meshRef.current.geometry) meshRef.current.geometry.dispose();
            if (meshRef.current.material instanceof THREE.Material) {
                meshRef.current.material.dispose();
            } else if (Array.isArray(meshRef.current.material)) {
                meshRef.current.material.forEach(material => material.dispose());
            }
        }
        
        // Create a new mesh with the updated geometry and visual style
        const newMesh = createPrismMesh(newGeometry, visualStyle, isUnfolded);
        if (sceneRef.current) {
            sceneRef.current.add(newMesh);
            meshRef.current = newMesh;
        }
        
        updateLabels(dimensions, sceneRef.current, newMesh, isUnfolded);
    }, [dimensions, isUnfolded, visualStyle]);

    return (
        <div 
            ref={containerRef} 
            style={{ width: '100%', height: '400px', position: 'relative' }} 
        />
    );
};

// Update the createPrismMesh function to maintain styling consistency
function createPrismMesh(geometry: THREE.BufferGeometry, visualStyle: VisualStyle, isUnfolded: boolean): THREE.Mesh {
    let material: THREE.Material | THREE.Material[];
    
    // Use consistent styling between folded and unfolded states
    switch (visualStyle) {
        case 'colored':
            material = new THREE.MeshBasicMaterial({
                vertexColors: true,
                side: THREE.DoubleSide
            });
            break;
            
        case 'wireframe':
            material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.1, // Slightly visible to help with face identification
                side: THREE.DoubleSide,
                depthWrite: false
            });
            break;
            
        case 'solid':
        default:
            material = new THREE.MeshPhongMaterial({
                color: 0x4a90e2,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide,
                shininess: 40,
                flatShading: false
            });
            break;
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Add prominent edges for better visualization
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ 
        color: 0x000000, 
        linewidth: isUnfolded ? 2 : 1, // Thicker lines when unfolded
        opacity: 1.0,
        transparent: false
    });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    mesh.add(edges);
    
    // For wireframe and unfolded state, add interior edges to distinguish faces
    if (isUnfolded) {
        // Create internal edges to separate faces in wireframe mode
        const segmentGeometry = new THREE.BufferGeometry();
        
        // Define lines between the faces to make them distinguishable
        const { topWidth, bottomWidth, height, depth } = (geometry.userData as { dimensions: TrapezoidalPrismDimensions }).dimensions || { 
            topWidth: 2, bottomWidth: 3, height: 2, depth: 2 
        };
        
        const halfTopWidth = topWidth / 2;
        const halfBottomWidth = bottomWidth / 2;
        const halfDepth = depth / 2;
        
        // Add lines between faces in the net
        const linePositions = [
            // Between bottom and front face
            -halfBottomWidth, 0, halfDepth, halfBottomWidth, 0, halfDepth,
            
            // Between bottom and back face
            -halfBottomWidth, 0, -halfDepth, halfBottomWidth, 0, -halfDepth,
            
            // Between bottom and left face
            -halfBottomWidth, 0, -halfDepth, -halfBottomWidth, 0, halfDepth,
            
            // Between bottom and right face
            halfBottomWidth, 0, -halfDepth, halfBottomWidth, 0, halfDepth,
            
            // Between front face and top face
            -halfTopWidth, 0, halfDepth + height, halfTopWidth, 0, halfDepth + height
        ];
        
        segmentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        
        // Create a separate material for these lines to make them more visible
        const lineMaterial = new THREE.LineBasicMaterial({
            color: visualStyle === 'wireframe' ? 0x333333 : 0x000000,
            linewidth: 3,
            opacity: visualStyle === 'wireframe' ? 1.0 : 0.9,
            transparent: true
        });
        
        const segments = new THREE.LineSegments(segmentGeometry, lineMaterial);
        mesh.add(segments);
    }
    
    return mesh;
}

// Improved updateLabels function with better label positioning
function updateLabels(dimensions: TrapezoidalPrismDimensions, scene: THREE.Scene, mesh: THREE.Mesh, isUnfolded: boolean): void {
    // Find existing labels group or create a new one
    let labelsGroup = scene.children.find(child => child instanceof THREE.Group) as THREE.Group;
    
    if (!labelsGroup) {
        labelsGroup = new THREE.Group();
        scene.add(labelsGroup);
    } else {
        // Clear existing labels
        while (labelsGroup.children.length > 0) {
            const child = labelsGroup.children[0];
            labelsGroup.remove(child);
            if (child instanceof CSS2DObject) {
                child.element.remove();
            }
        }
    }
  
    const { topWidth, bottomWidth, height, depth } = dimensions;

    const createLabel = (position: THREE.Vector3, text: string, color?: string) => {
        const div = document.createElement('div');
        div.className = 'annotation';
        div.textContent = text;
        div.style.backgroundColor = color || 'rgba(255, 255, 255, 0.8)';
        div.style.color = 'black';
        div.style.padding = '2px 6px';
        div.style.borderRadius = '4px';
        div.style.fontSize = '0.8em';
        div.style.pointerEvents = 'none';
        div.style.border = '1px solid rgba(0,0,0,0.3)';
        
        const label = new CSS2DObject(div);
        label.position.copy(position);
        
        labelsGroup.add(label);
    };

    if (!isUnfolded) {
        // Regular labeling for folded prism - unchanged
        // Top face midpoints
        const topFrontMidpoint = new THREE.Vector3(0, height, depth / 2);
        
        // Bottom face midpoints
        const bottomFrontMidpoint = new THREE.Vector3(0, 0, depth / 2);
        const bottomLeftMidpoint = new THREE.Vector3(-bottomWidth / 2, 0, 0);
        
        // Height midpoints
        const frontRightHeightMidpoint = new THREE.Vector3(bottomWidth / 2, height / 2, depth / 2);
        
        // Create labels
        createLabel(topFrontMidpoint, `TW: ${topWidth.toFixed(1)}`);
        createLabel(bottomFrontMidpoint, `BW: ${bottomWidth.toFixed(1)}`);
        createLabel(bottomLeftMidpoint, `D: ${depth.toFixed(1)}`);
        createLabel(frontRightHeightMidpoint, `H: ${height.toFixed(1)}`);
    } else {
        // More precise labels for unfolded prism
        const halfTopWidth = topWidth / 2;
        const halfBottomWidth = bottomWidth / 2;
        const halfDepth = depth / 2;
        
        // Calculate exact coordinates for improved label positioning
        
        // Bottom face - position labels along the edges
        createLabel(
            new THREE.Vector3(0, 0.2, 0), 
            `Bottom Face`,
            'rgba(173, 216, 230, 0.7)'
        );
        
        // Width label on bottom face
        createLabel(
            new THREE.Vector3(0, 0.1, -halfDepth * 0.5), 
            `BW: ${bottomWidth.toFixed(1)}`
        );
        
        // Depth label on bottom face
        createLabel(
            new THREE.Vector3(-halfBottomWidth * 0.6, 0.1, 0), 
            `D: ${depth.toFixed(1)}`
        );
        
        // Front face - position labels along the edges
        const frontFaceZ = halfDepth;
        createLabel(
            new THREE.Vector3(0, 0.2, frontFaceZ + height * 0.5), 
            `Front Face`,
            'rgba(255, 200, 200, 0.7)'
        );
        
        // Bottom width label on front face
        createLabel(
            new THREE.Vector3(0, 0.1, frontFaceZ + height * 0.1), 
            `BW: ${bottomWidth.toFixed(1)}`
        );
        
        // Height label on front face
        createLabel(
            new THREE.Vector3(halfBottomWidth * 0.7, 0.1, frontFaceZ + height * 0.5), 
            `H: ${height.toFixed(1)}`
        );
        
        // Back face - position labels appropriately
        const backFaceZ = -halfDepth;
        createLabel(
            new THREE.Vector3(0, 0.2, backFaceZ - height * 0.5), 
            `Back Face`,
            'rgba(200, 255, 200, 0.7)'
        );
        
        // Bottom width label on back face
        createLabel(
            new THREE.Vector3(0, 0.1, backFaceZ - height * 0.1), 
            `BW: ${bottomWidth.toFixed(1)}`
        );
        
        // Height label on back face
        createLabel(
            new THREE.Vector3(halfBottomWidth * 0.7, 0.1, backFaceZ - height * 0.5), 
            `H: ${height.toFixed(1)}`
        );
        
        // Left face - position labels along the edges
        const leftFaceX = -halfBottomWidth;
        createLabel(
            new THREE.Vector3(leftFaceX - height * 0.5, 0.2, 0), 
            `Left Face`,
            'rgba(255, 255, 200, 0.7)'
        );
        
        // Depth label on left face
        createLabel(
            new THREE.Vector3(leftFaceX - height * 0.1, 0.1, 0), 
            `D: ${depth.toFixed(1)}`
        );
        
        // Height label on left face
        createLabel(
            new THREE.Vector3(leftFaceX - height * 0.5, 0.1, halfDepth * 0.7), 
            `H: ${height.toFixed(1)}`
        );
        
        // Right face - position labels along the edges
        const rightFaceX = halfBottomWidth;
        createLabel(
            new THREE.Vector3(rightFaceX + height * 0.5, 0.2, 0), 
            `Right Face`,
            'rgba(200, 255, 255, 0.7)'
        );
        
        // Depth label on right face
        createLabel(
            new THREE.Vector3(rightFaceX + height * 0.1, 0.1, 0), 
            `D: ${depth.toFixed(1)}`
        );
        
        // Height label on right face
        createLabel(
            new THREE.Vector3(rightFaceX + height * 0.5, 0.1, halfDepth * 0.7), 
            `H: ${height.toFixed(1)}`
        );
        
        // Top face - position labels along the edges
        const topFaceZ = frontFaceZ + height;
        createLabel(
            new THREE.Vector3(0, 0.2, topFaceZ + halfDepth), 
            `Top Face`,
            'rgba(255, 200, 255, 0.7)'
        );
        
        // Top width label on top face
        createLabel(
            new THREE.Vector3(0, 0.1, topFaceZ + halfDepth * 0.4), 
            `TW: ${topWidth.toFixed(1)}`
        );
        
        // Depth label on top face
        createLabel(
            new THREE.Vector3(halfTopWidth * 0.7, 0.1, topFaceZ + halfDepth * 0.7), 
            `D: ${depth.toFixed(1)}`
        );
    }
}

// Update createTrapezoidalPrismGeometry to store dimensions in userData
function createTrapezoidalPrismGeometry(dimensions: TrapezoidalPrismDimensions, isUnfolded: boolean): THREE.BufferGeometry {
  const { topWidth, bottomWidth, height, depth } = dimensions;
  
  let geometry: THREE.BufferGeometry;
  
  if (!isUnfolded) {
    // Regular folded trapezoidal prism geometry
    const halfTopWidth = topWidth / 2;
    const halfBottomWidth = bottomWidth / 2;
    const halfDepth = depth / 2;
    
    // Define the vertices (8 corners of the prism)
    const vertices = [
        // Bottom face
        -halfBottomWidth, 0, -halfDepth,  // 0: bottom left back
        halfBottomWidth, 0, -halfDepth,   // 1: bottom right back
        halfBottomWidth, 0, halfDepth,    // 2: bottom right front
        -halfBottomWidth, 0, halfDepth,   // 3: bottom left front
        
        // Top face
        -halfTopWidth, height, -halfDepth, // 4: top left back
        halfTopWidth, height, -halfDepth,  // 5: top right back
        halfTopWidth, height, halfDepth,   // 6: top right front
        -halfTopWidth, height, halfDepth   // 7: top left front
    ];
    
    // Define the faces (12 triangles forming 6 rectangular faces)
    const indices = [
        // Bottom face - BLUE
        0, 2, 1, 0, 3, 2,
        
        // Top face - PURPLE
        4, 5, 6, 4, 6, 7,
        
        // Front face - RED
        3, 7, 6, 3, 6, 2,
        
        // Back face - GREEN
        0, 1, 5, 0, 5, 4,
        
        // Left face - YELLOW
        0, 4, 7, 0, 7, 3,
        
        // Right face - CYAN
        1, 2, 6, 1, 6, 5
    ];

    // Use non-indexed geometry for proper face coloring
    const positionBuffer = [];
    const colorBuffer = [];

    // Process each triangle and assign colors
    for (let i = 0; i < indices.length; i += 3) {
        const faceIndex = Math.floor(i / 6); // Determine which face we're on
        let faceColor;
        
        // Assign colors based on face index
        switch(faceIndex) {
            case 0: faceColor = [0.3, 0.3, 0.9]; break; // Bottom - BLUE
            case 1: faceColor = [0.9, 0.3, 0.9]; break; // Top - PURPLE
            case 2: faceColor = [0.9, 0.3, 0.3]; break; // Front - RED
            case 3: faceColor = [0.3, 0.9, 0.3]; break; // Back - GREEN
            case 4: faceColor = [0.9, 0.9, 0.3]; break; // Left - YELLOW
            case 5: faceColor = [0.3, 0.9, 0.9]; break; // Right - CYAN
        }
        
        // For each vertex in this triangle
        for (let j = 0; j < 3; j++) {
            const vertexIndex = indices[i + j];
            // Add position
            positionBuffer.push(
                vertices[vertexIndex * 3],
                vertices[vertexIndex * 3 + 1],
                vertices[vertexIndex * 3 + 2]
            );
            // Add color
            if (faceColor) {
                colorBuffer.push(...faceColor);
            }
        }
    }
    
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionBuffer, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorBuffer, 3));
  } else {
    const halfTopWidth = topWidth / 2;
    const halfBottomWidth = bottomWidth / 2;
    const halfDepth = depth / 2;
    const _spacing = 0; // Removed gap for natural connectivity

    const vertices = [];
    const colors = [];
    
    // Bottom face (centered at origin) - BLUE
    vertices.push(
      -halfBottomWidth, 0, -halfDepth, // bottom left back
      halfBottomWidth, 0, -halfDepth,  // bottom right back
      halfBottomWidth, 0, halfDepth,   // bottom right front
      -halfBottomWidth, 0, halfDepth   // bottom left front
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.3, 0.3, 0.9);
    }
    
    // Front face - attach directly to bottom face front edge
    const frontFaceZ = halfDepth; 
    vertices.push(
      -halfBottomWidth, 0, frontFaceZ,          // bottom left
      halfBottomWidth, 0, frontFaceZ,           // bottom right
      halfTopWidth, 0, frontFaceZ + height,     // top right
      -halfTopWidth, 0, frontFaceZ + height      // top left
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.9, 0.3, 0.3);
    }
    
    // Back face - attach to bottom face back edge
    const backFaceZ = -halfDepth;
    vertices.push(
      halfBottomWidth, 0, backFaceZ,           // bottom left (from back view)
      -halfBottomWidth, 0, backFaceZ,          // bottom right (from back view)
      -halfTopWidth, 0, backFaceZ - height,    // top right (from back view)
      halfTopWidth, 0, backFaceZ - height      // top left (from back view)
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.3, 0.9, 0.3);
    }
    
    // Left face - attach to bottom face left edge
    const leftFaceX = -halfBottomWidth;
    vertices.push(
      leftFaceX, 0, -halfDepth,              // bottom left
      leftFaceX, 0, halfDepth,               // bottom right
      leftFaceX - height, 0, halfDepth,      // top right
      leftFaceX - height, 0, -halfDepth      // top left
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.9, 0.9, 0.3);
    }
    
    // Right face - attach to bottom face right edge
    const rightFaceX = halfBottomWidth;
    vertices.push(
      rightFaceX, 0, halfDepth,              // bottom left
      rightFaceX, 0, -halfDepth,             // bottom right
      rightFaceX + height, 0, -halfDepth,    // top right
      rightFaceX + height, 0, halfDepth      // top left
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.3, 0.9, 0.9);
    }
    
    // Top face - attach to front face top edge
    const topFaceZ = frontFaceZ + height;
    vertices.push(
      -halfTopWidth, 0, topFaceZ,           // bottom left
      halfTopWidth, 0, topFaceZ,            // bottom right
      halfTopWidth, 0, topFaceZ + depth,    // top right
      -halfTopWidth, 0, topFaceZ + depth    // top left
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.9, 0.3, 0.9);
    }
    
    // Define faces (each rectangular face is made of 2 triangles)
    const indices = [
      // Bottom face (blue)
      0, 2, 1, 0, 3, 2,
      
      // Front face (red)
      4, 6, 5, 4, 7, 6,
      
      // Back face (green)
      8, 10, 9, 8, 11, 10,
      
      // Left face (yellow)
      12, 14, 13, 12, 15, 14,
      
      // Right face (cyan)
      16, 18, 17, 16, 19, 18,
      
      // Top face (purple)
      20, 22, 21, 20, 23, 22
    ];
    
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
  }
  
  // Store dimensions in the geometry's userData for later access
  geometry.userData = { dimensions };
  
  geometry.computeVertexNormals();
  
  return geometry;
}

export default TrapezoidalPrism;