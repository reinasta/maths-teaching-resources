import React, { useEffect, useRef } from 'react';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as THREE from 'three'; // Ensure THREE is imported for Vector3 etc.
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrapezoidalPrismDimensions, VisualStyle, LabelConfig, TrapezoidalPrismCalculations } from '../../app/components/standalone/trapezoidal-prism/types'; // Ensure types are correctly imported

// Export the interface so it can be imported in test files
export interface TrapezoidalPrismProps {
  dimensions: TrapezoidalPrismDimensions;
  isUnfolded?: boolean;
  visualStyle: VisualStyle;
  labelConfig?: LabelConfig;
  calculations?: TrapezoidalPrismCalculations;
}

const TrapezoidalPrism: React.FC<TrapezoidalPrismProps> = ({ 
  dimensions, 
  isUnfolded = false,
  visualStyle = 'solid',
  labelConfig = { showVolume: true, showSurfaceArea: false, showFaces: false },
  calculations // Destructure calculations
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const labelRendererRef = useRef<CSS2DRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const meshRef = useRef<THREE.Mesh | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const _edgesRef = useRef<THREE.LineSegments | null>(null);

    useEffect(() => {
        const currentContainer = containerRef.current;
        // const currentLabelsGroup = labelsGroupRef.current; // This can be removed if labelsGroup is managed by name
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

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight2.position.set(-5, 3, -10);
        scene.add(directionalLight2);

        const prismGeometry = createTrapezoidalPrismGeometry(dimensions, isUnfolded);
        
        const mesh = createPrismMesh(prismGeometry, visualStyle, isUnfolded);
        scene.add(mesh);
        meshRef.current = mesh;

        // Ensure labelsGroup is created and named for reliable access
        let labelsGroup = scene.children.find(child => child.name === 'labelsGroup') as THREE.Group;
        if (!labelsGroup) {
            labelsGroup = new THREE.Group();
            labelsGroup.name = 'labelsGroup';
            scene.add(labelsGroup);
        }
        // labelsGroupRef.current = labelsGroup; // Still useful if direct ref is needed elsewhere
        
        updateLabels(dimensions, scene, mesh, isUnfolded, labelConfig, calculations, visualStyle); 

        const animate = () => {
            requestAnimationFrame(animate);
            orbitControls.update();
            webGLRenderer.render(scene, camera);
            css2DRenderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!currentContainer || !cameraRef.current || !rendererRef.current || !labelRendererRef.current) return;
            const width = currentContainer.clientWidth;
            const height = currentContainer.clientHeight;

            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(width, height);
            labelRendererRef.current.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (rendererRef.current) rendererRef.current.dispose();
            if (labelRendererRef.current) labelRendererRef.current.domElement.remove();
            
            if (currentContainer && rendererRef.current) {
                // Check if domElement is still a child before removing
                if (rendererRef.current.domElement.parentNode === currentContainer) {
                    currentContainer.removeChild(rendererRef.current.domElement);
                }
            }

            // Clear labels from the specific group by name
            const groupToRemove = sceneRef.current?.children.find(child => child.name === 'labelsGroup') as THREE.Group;
            if (groupToRemove) {
                while (groupToRemove.children.length > 0) {
                    const child = groupToRemove.children[0];
                    groupToRemove.remove(child);
                    if (child instanceof CSS2DObject) {
                        if (child.element && child.element.parentNode) {
                            child.element.parentNode.removeChild(child.element);
                        }
                    }
                }
                sceneRef.current?.remove(groupToRemove);
            }
        };
    }, [dimensions, isUnfolded, visualStyle, labelConfig, calculations]);

    useEffect(() => {
        if (!meshRef.current || !sceneRef.current) return;
        
        const newGeometry = createTrapezoidalPrismGeometry(dimensions, isUnfolded);
        
        if (sceneRef.current && meshRef.current) {
            sceneRef.current.remove(meshRef.current);
            if (meshRef.current.geometry) meshRef.current.geometry.dispose();
            if (meshRef.current.material instanceof THREE.Material) {
                meshRef.current.material.dispose();
            } else if (Array.isArray(meshRef.current.material)) {
                meshRef.current.material.forEach(material => material.dispose());
            }
        }
        
        const newMesh = createPrismMesh(newGeometry, visualStyle, isUnfolded);
        if (sceneRef.current) {
            sceneRef.current.add(newMesh);
            meshRef.current = newMesh;
        }
        
        // Ensure scene and mesh are available for updateLabels
        if (sceneRef.current && meshRef.current) {
             updateLabels(dimensions, sceneRef.current, newMesh, isUnfolded, labelConfig, calculations, visualStyle);
        }
    }, [dimensions, isUnfolded, visualStyle, labelConfig, calculations]);

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
function updateLabels(
  dimensions: TrapezoidalPrismDimensions,
  scene: THREE.Scene,
  _mesh: THREE.Mesh, 
  isUnfolded: boolean,
  labelConfig: LabelConfig = { showVolume: true, showSurfaceArea: false, showFaces: false },
  calculations?: TrapezoidalPrismCalculations,
  _visualStyle: VisualStyle = 'solid'
): void {
  let labelsGroup = scene.children.find(child => child.name === 'labelsGroup') as THREE.Group;
  if (!labelsGroup) {
    labelsGroup = new THREE.Group();
    labelsGroup.name = 'labelsGroup';
    scene.add(labelsGroup);
  } else {
    while (labelsGroup.children.length > 0) {
      const child = labelsGroup.children[0];
      labelsGroup.remove(child);
      if (child instanceof CSS2DObject) {
        if (child.element && child.element.parentNode) {
          child.element.parentNode.removeChild(child.element);
        }
      }
    }
  }

  if (!labelConfig.showVolume && !labelConfig.showSurfaceArea && !labelConfig.showFaces) {
    return;
  }

  const { topWidth, bottomWidth, height, depth: prismDepth } = dimensions; // Renamed depth to prismDepth for clarity

  const createLabel = (position: THREE.Vector3, text: string, color: string = '#333333', className: string = 'label', offset?: THREE.Vector3) => {
    const div = document.createElement('div');
    div.className = className;
    div.textContent = text;
    div.style.color = color;
    div.style.fontSize = '12px';
    div.style.fontFamily = 'Arial, sans-serif';
    div.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
    div.style.padding = '2px 5px';
    div.style.borderRadius = '3px';
    div.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    div.style.pointerEvents = 'none';

    const label = new CSS2DObject(div);
    label.position.copy(position);
    if (offset) {
      label.position.add(offset);
    }
    return label;
  };

  if (!isUnfolded) {
    // --- FOLDED STATE LOGIC (remains the same) ---
    const yBase = -height / 2;
    const yTop = height / 2;
    const zFront = prismDepth / 2;
    const zBack = -prismDepth / 2;
    const xOffset_bottom_left = -bottomWidth / 2;
    const xOffset_bottom_right = bottomWidth / 2;

    let horiz_proj_left = 0;
    let horiz_proj_right = 0;

    if (calculations) {
      if (calculations.leftSide * calculations.leftSide >= height * height) {
        horiz_proj_left = Math.sqrt(calculations.leftSide * calculations.leftSide - height * height);
      }
      if (calculations.rightSide * calculations.rightSide >= height * height) {
        horiz_proj_right = Math.sqrt(calculations.rightSide * calculations.rightSide - height * height);
      }
    }

    const v_bottom_left_front = new THREE.Vector3(xOffset_bottom_left, yBase, zFront);
    const v_bottom_right_front = new THREE.Vector3(xOffset_bottom_right, yBase, zFront);
    const v_top_left_front = new THREE.Vector3(xOffset_bottom_left + horiz_proj_left, yTop, zFront);
    const v_top_right_front = new THREE.Vector3(xOffset_bottom_right - horiz_proj_right, yTop, zFront);

    const v_bottom_left_back = new THREE.Vector3(xOffset_bottom_left, yBase, zBack);
    const v_bottom_right_back = new THREE.Vector3(xOffset_bottom_right, yBase, zBack);
    const v_top_left_back = new THREE.Vector3(xOffset_bottom_left + horiz_proj_left, yTop, zBack);
    const v_top_right_back = new THREE.Vector3(xOffset_bottom_right - horiz_proj_right, yTop, zBack);

    if (labelConfig.showSurfaceArea || labelConfig.showVolume) {
      const topEdgeCenter = new THREE.Vector3().addVectors(v_top_left_front, v_top_right_front).multiplyScalar(0.5);
      labelsGroup.add(createLabel(topEdgeCenter, `Wₜ: ${topWidth.toFixed(1)}`, '#0000FF', 'label', new THREE.Vector3(0, 0.2, 0)));
      const bottomEdgeCenter = new THREE.Vector3().addVectors(v_bottom_left_front, v_bottom_right_front).multiplyScalar(0.5);
      labelsGroup.add(createLabel(bottomEdgeCenter, `Wᵦ: ${bottomWidth.toFixed(1)}`, '#0000FF', 'label', new THREE.Vector3(0, -0.2, 0)));
      const heightLabelX = (v_top_left_front.x < v_bottom_left_front.x ? v_top_left_front.x : v_bottom_left_front.x) - 0.3;
      labelsGroup.add(createLabel(new THREE.Vector3(heightLabelX, 0, zFront), `H: ${height.toFixed(1)}`, '#FF0000', 'label'));
      const depthEdgeCenter = new THREE.Vector3().addVectors(v_bottom_left_front, v_bottom_left_back).multiplyScalar(0.5);
      labelsGroup.add(createLabel(depthEdgeCenter, `D: ${prismDepth.toFixed(1)}`, '#FFA500', 'label', new THREE.Vector3(0, -0.2, 0)));

      if (labelConfig.showSurfaceArea) {
        if (!calculations) {
          console.warn('Surface area labels (Sl, Sr) require calculations, but calculations are undefined.');
          labelsGroup.add(createLabel(new THREE.Vector3(0,0,0), "SA calculations missing for Sl/Sr!", "red"));
        } else {
          const { leftSide, rightSide } = calculations;
          const leftSlantedEdgeCenter = new THREE.Vector3().addVectors(v_bottom_left_front, v_top_left_front).multiplyScalar(0.5);
          labelsGroup.add(createLabel(leftSlantedEdgeCenter, `Sₗ: ${leftSide.toFixed(1)}`, '#008000', 'label', new THREE.Vector3(-0.2, 0, 0)));
          const rightSlantedEdgeCenter = new THREE.Vector3().addVectors(v_bottom_right_front, v_top_right_front).multiplyScalar(0.5);
          labelsGroup.add(createLabel(rightSlantedEdgeCenter, `Sᵣ: ${rightSide.toFixed(1)}`, '#008000', 'label', new THREE.Vector3(0.2, 0, 0)));
        }
      }
    }
    if (labelConfig.showFaces) {
      const faceLabelColor = '#333333';
      labelsGroup.add(createLabel(new THREE.Vector3(0, yBase, 0), "Bottom", faceLabelColor, 'face-label', new THREE.Vector3(0, -0.3, 0)));
      const topFaceCenter = new THREE.Vector3((v_top_left_front.x+v_top_right_front.x+v_top_left_back.x+v_top_right_back.x)/4, yTop, (v_top_left_front.z+v_top_right_front.z+v_top_left_back.z+v_top_right_back.z)/4);
      labelsGroup.add(createLabel(topFaceCenter, "Top", faceLabelColor, 'face-label', new THREE.Vector3(0, 0.3, 0)));
      const frontFaceCenter = new THREE.Vector3().add(v_bottom_left_front).add(v_bottom_right_front).add(v_top_left_front).add(v_top_right_front).multiplyScalar(0.25);
      labelsGroup.add(createLabel(frontFaceCenter, "Front", faceLabelColor, 'face-label', new THREE.Vector3(0, 0, 0.3)));
      const backFaceCenter = new THREE.Vector3().add(v_bottom_left_back).add(v_bottom_right_back).add(v_top_left_back).add(v_top_right_back).multiplyScalar(0.25);
      labelsGroup.add(createLabel(backFaceCenter, "Back", faceLabelColor, 'face-label', new THREE.Vector3(0, 0, -0.3)));
      const leftFaceCenter = new THREE.Vector3().add(v_bottom_left_front).add(v_top_left_front).add(v_bottom_left_back).add(v_top_left_back).multiplyScalar(0.25);
      labelsGroup.add(createLabel(leftFaceCenter, "Left Side", faceLabelColor, 'face-label', new THREE.Vector3(-0.3, 0, 0)));
      const rightFaceCenter = new THREE.Vector3().add(v_bottom_right_front).add(v_top_right_front).add(v_bottom_right_back).add(v_top_right_back).multiplyScalar(0.25);
      labelsGroup.add(createLabel(rightFaceCenter, "Right Side", faceLabelColor, 'face-label', new THREE.Vector3(0.3, 0, 0)));
    }
  } else {
    // --- UNFOLDED STATE LOGIC (Labels in XZ plane, Y is for offset from plane) ---
    const halfBottomWidth = bottomWidth / 2;
    const halfTopWidth = topWidth / 2;
    const halfPrismDepth = prismDepth / 2; // Half of the prism's depth dimension
    const yLabelOffset = 0.1; // All labels slightly above the XZ plane of the net
    const labelOffsetSmall = 0.2; // Small offset for positioning labels away from edges

    // Dimension Labels (Volume or Surface Area)
    if (labelConfig.showSurfaceArea || labelConfig.showVolume) {
      // Bottom Face (Wb, D)
      labelsGroup.add(createLabel(new THREE.Vector3(0, yLabelOffset, halfPrismDepth + labelOffsetSmall), `Wᵦ: ${bottomWidth.toFixed(1)}`, '#0000FF'));
      labelsGroup.add(createLabel(new THREE.Vector3(-halfBottomWidth - labelOffsetSmall, yLabelOffset, 0), `D: ${prismDepth.toFixed(1)}`, '#FFA500'));

      // Front Face (H)
      // Center Z of Front Face: halfPrismDepth + height / 2
      // Place H label to the side of the front face, aligned with its height.
      labelsGroup.add(createLabel(new THREE.Vector3(-halfBottomWidth - labelOffsetSmall, yLabelOffset, halfPrismDepth + height / 2), `H: ${height.toFixed(1)}`, '#FF0000'));

      // Top Face (Wt)
      // Top face is attached to front face, its Z starts at halfPrismDepth + height
      // Center Z of Top Face: halfPrismDepth + height + halfPrismDepth / 2 (if top face rectangle has length `prismDepth`)
      // The top face in the net is a rectangle of topWidth x prismDepth.
      // It starts at Z = halfPrismDepth + height. Its length is prismDepth.
      // So it ends at Z = halfPrismDepth + height + prismDepth.
      // Wt label for Top Face, place it beyond its Z extent.
      labelsGroup.add(createLabel(new THREE.Vector3(0, yLabelOffset, halfPrismDepth + height + halfPrismDepth + labelOffsetSmall), `Wₜ: ${topWidth.toFixed(1)}`, '#0000FF'));

      if (labelConfig.showSurfaceArea) {
        if (!calculations) {
          console.warn('Surface area labels (Sl, Sr) require calculations, but calculations are undefined.');
          labelsGroup.add(createLabel(new THREE.Vector3(0, yLabelOffset, halfPrismDepth + height / 2), "SA calc missing!", "red"));
        } else {
          const { leftSide, rightSide } = calculations;
          // Slanted side labels on the Front Face trapezoid
          // Left slanted side (v4-v7 of geometry): midX = (-hBW-hTW)/2, midZ = hD+H/2
          const slMidX = (-halfBottomWidth - halfTopWidth) / 2;
          const slSrMidZ = halfPrismDepth + height / 2;
          labelsGroup.add(createLabel(new THREE.Vector3(slMidX - labelOffsetSmall, yLabelOffset, slSrMidZ), `Sₗ: ${leftSide.toFixed(1)}`, '#008000'));
          // Right slanted side (v5-v6 of geometry): midX = (hBW+hTW)/2, midZ = hD+H/2
          const srMidX = (halfBottomWidth + halfTopWidth) / 2;
          labelsGroup.add(createLabel(new THREE.Vector3(srMidX + labelOffsetSmall, yLabelOffset, slSrMidZ), `Sᵣ: ${rightSide.toFixed(1)}`, '#008000'));
        }
      }
    }

    // Face Labels (Unfolded)
    if (labelConfig.showFaces) {
      const faceLabelColor = '#333333';

      // Bottom Face (Center X=0, Z=0)
      labelsGroup.add(createLabel(new THREE.Vector3(0, yLabelOffset, 0), "Bottom", faceLabelColor, 'face-label'));

      // Front Face (Center X=0, Z = halfPrismDepth + height/2)
      labelsGroup.add(createLabel(new THREE.Vector3(0, yLabelOffset, halfPrismDepth + height / 2), "Front", faceLabelColor, 'face-label'));

      // Top Face (Center X=0, Z = halfPrismDepth + height + prismDepth/2)
      labelsGroup.add(createLabel(new THREE.Vector3(0, yLabelOffset, halfPrismDepth + height + prismDepth/2), "Top", faceLabelColor, 'face-label'));

      // Back Face (Center X=0, Z = -halfPrismDepth - height/2)
      labelsGroup.add(createLabel(new THREE.Vector3(0, yLabelOffset, -halfPrismDepth - height / 2), "Back", faceLabelColor, 'face-label'));

      // Left Face (Center X = -halfBottomWidth - height/2, Z=0)
      // The width of this unfolded rectangle is `height` (trapezoid height)
      labelsGroup.add(createLabel(new THREE.Vector3(-halfBottomWidth - height/2, yLabelOffset, 0), "Left Side", faceLabelColor, 'face-label'));

      // Right Face (Center X = halfBottomWidth + height/2, Z=0)
      labelsGroup.add(createLabel(new THREE.Vector3(halfBottomWidth + height/2, yLabelOffset, 0), "Right Side", faceLabelColor, 'face-label'));
    }
  }
}

// Update createTrapezoidalPrismGeometry to store dimensions in userData
export function createTrapezoidalPrismGeometry(dimensions: TrapezoidalPrismDimensions, isUnfolded: boolean): THREE.BufferGeometry {
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