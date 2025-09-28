import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

let scene, camera, renderer, composer, aiCore, starField;
const mouse = new THREE.Vector2();

gsap.registerPlugin(ScrollTrigger);

// --- CORE 3D SCENE SETUP ---
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('main-canvas'), antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.4, 0.85);
    composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    const starVertices = [];
    for (let i = 0; i < 5000; i++) { 
        starVertices.push(THREE.MathUtils.randFloatSpread(2000));
        starVertices.push(THREE.MathUtils.randFloatSpread(2000));
        starVertices.push(THREE.MathUtils.randFloatSpread(2000));
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starField = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 }));
    scene.add(starField);

    const coreGeo = new THREE.IcosahedronGeometry(1.2, 5);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 0.1, transparent: true, opacity: 0.5 });
    const mainCore = new THREE.Mesh(coreGeo, coreMat);
    const wireframe = new THREE.LineSegments( new THREE.WireframeGeometry(coreGeo), new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.2 }) );
    aiCore = new THREE.Group();
    aiCore.add(mainCore);
    aiCore.add(wireframe);
    scene.add(aiCore);
    
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    
    setupSounds();
    setupScrollAnimations();
    animate();
}

function setupScrollAnimations() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#scroll-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
        }
    });

    tl.to(camera.position, { z: 4, y: -1 }, 0);
    tl.to(aiCore.rotation, { x: Math.PI * 0.2, y: Math.PI * 0.4 }, 0);
    tl.from("#projects-section .content-box", { opacity: 0, x: -100 }, 0);

    tl.to(camera.position, { z: 2.5, y: 0.5, x: 1 }, 1);
    tl.to(aiCore.rotation, { x: Math.PI * 0.4, y: Math.PI * 0.8 }, 1);
    tl.to("#projects-section .content-box", { opacity: 0, x: -100 }, 1);
    tl.from("#skills-section .content-box", { opacity: 0, x: 100 }, 1);

    tl.to(camera.position, { z: 3, y: -0.5, x: -1 }, 2);
    tl.to(aiCore.rotation, { x: Math.PI * 0.6, y: Math.PI * 1.2 }, 2);
    tl.to("#skills-section .content-box", { opacity: 0, x: 100 }, 2);
    tl.from("#experience-section .content-box", { opacity: 0, x: -100 }, 2);

    tl.to(camera.position, { z: 8, y: 0, x: 0 }, 3);
    tl.to(aiCore.rotation, { x: 0, y: Math.PI * 2 }, 3);
    tl.to("#experience-section .content-box", { opacity: 0, x: -100 }, 3);
    tl.from("#contact-section > div", { opacity: 0, y: 100 }, 3);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
    requestAnimationFrame(animate);
    camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);
    starField.rotation.y += 0.0001;
    aiCore.rotation.z += 0.001;
    composer.render();
}

// --- INTRO & SOUND ---
const entryScreen = document.getElementById('entry-screen');
const entryMainContent = document.getElementById('entry-main-content');
const initButton = document.getElementById('init-button');
const pageHeader = document.getElementById('page-header');
let synth;

function setupSounds() {
    if (!synth) {
        synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.5 },
        }).toDestination();
    }
}

function typeText(element, text, onComplete) {
    let i = 0;
    const target = document.querySelector(element);
    if (!target) return;
    target.textContent = "";
    const interval = setInterval(() => {
        target.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(interval);
            if (onComplete) onComplete();
        }
    }, 60);
}

const greetingLine = document.getElementById('greeting-line');
const mainBio = document.getElementById('main-bio');

// Set initial positions for animation
gsap.set(greetingLine, { y: '25vh', opacity: 1 }); // Center the greeting text and ensure it's visible
gsap.set(mainBio, { opacity: 0 }); // Hide the bio content

const entryTl = gsap.timeline({ delay: 0.5 });
entryTl.to(entryMainContent, { opacity: 1, duration: 0.2 })
    .call(() => {
        typeText('#greeting-line > p', "Greetings, Voyager", () => {
            // After typing is complete, start the reveal animation
            const revealTl = gsap.timeline({ delay: 0.3 });
            revealTl.to(greetingLine, {
                y: 0, // Animate greeting line to its final position at the top
                duration: 1,
                ease: 'power3.inOut'
            })
            .to(mainBio, {
                opacity: 1, // Fade in the main bio section
                duration: 0.5,
                onStart: () => {
                     // Stagger-animate each line of the bio
                    gsap.from(".bio-line", {
                        duration: 0.8,
                        y: 30,
                        opacity: 0,
                        stagger: 0.1,
                        ease: 'power2.out'
                    });
                     // Fade in the button after the bio lines start appearing
                    gsap.fromTo("#init-button", { opacity: 0, y: 20 }, {
                        delay: 0.5,
                        duration: 1,
                        opacity: 1,
                        y: 0,
                        ease: 'power2.out'
                    });
                }
            }, "-=0.7"); // Overlap this animation with the greeting moving up
        });
    });

initButton.addEventListener('mouseenter', () => {
    if (Tone.context.state !== 'running') { Tone.start(); }
    synth.triggerAttackRelease('C5', '16n');
});

initButton.addEventListener('click', () => {
    if (Tone.context.state !== 'running') { Tone.start(); }
    synth.triggerAttackRelease('G4', '4n');

    const voyageTl = gsap.timeline({
        onComplete: () => {
            entryScreen.style.display = 'none';
            document.body.style.overflowY = 'auto';
            pageHeader.classList.add('visible');
            gsap.set(camera, { fov: 75 });
            camera.updateProjectionMatrix();
        }
    });

    voyageTl
        .to('#entry-main-content > *', {
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.in'
        })
        .set(aiCore.scale, { x: 0.01, y: 0.01, z: 0.01 })
        .to(entryScreen, { 
            backgroundColor: 'transparent', 
            duration: 1, 
            ease: 'power2.out' 
        }, ">-0.2")
        .to(camera, {
            fov: 130,
            duration: 1.2,
            ease: 'power3.in',
            onUpdate: () => camera.updateProjectionMatrix()
        }, "<")
        .to(aiCore.scale, {
            x: 1, y: 1, z: 1,
            duration: 1.5,
            ease: 'power3.out'
        }, "<")
        .to(camera.position, {
            z: 5,
            duration: 2.5,
            ease: 'power2.inOut'
        }, "<")
        .to(camera, {
            fov: 75,
            duration: 1.5,
            ease: 'power3.out',
            onUpdate: () => camera.updateProjectionMatrix()
        }, ">-0.5");
});

init();

// --- CUSTOM CURSOR LOGIC ---
const customCursor = document.getElementById('custom-cursor');
if (customCursor) {
    window.addEventListener('mousemove', e => {
        gsap.to(customCursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.2,
            ease: 'power2.out'
        });
    });

    document.querySelectorAll('a, button, input, textarea, .project-item').forEach(el => {
        el.addEventListener('mouseenter', () => customCursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => customCursor.classList.remove('hover'));
    });
}

// --- PROJECTS SECTION ---
const projectsData = [
    {
        title: 'AI-Powered Tactical Scanner',
        tags: ['YOLOv8', 'ResNet', 'MiDaS', 'LSTM', 'AI'],
        description: 'Engineered an AI system to analyze real-time camera feeds, detecting personnel, weapons, and vehicles. Applied YOLOv8, ResNet, and MiDaS for object detection, classification, and depth estimation with ballistic trajectory modeling. Built a real-time tactical interface with live overlays, alerts, and LSTM-based action recommendations.',
        model: 'reticle' 
    },
    {
        title: 'Asteroid Classifier',
        tags: ['Python', 'Streamlit', 'scikit-learn', 'NASA API'],
        description: 'Built a Streamlit app using NASA NeoWs API to classify asteroids as safe or hazardous with a machine learning model. It displays the top 10 nearest asteroids, their speed, size, and orbit data with color-coded alerts.',
        model: 'asteroid'
    },
    { 
        title: 'AI-Powered Fashion Advisor', 
        tags: ['ResNet', 'CLIP', 'Flask'], 
        description: 'A deep learning fashion recommendation engine using ResNet & CLIP.', 
        model: 'diamond'
    },
    { 
        title: 'POPCULT Concert Assistant', 
        tags: ['React', 'Node.js', 'AI'], 
        description: 'An intelligent concert companion app with AI-driven outfit suggestions.', 
        model: 'equalizer'
    },
    { 
        title: 'Duplicate File Manager', 
        tags: ['React', 'Python', 'SHA-265'], 
        description: 'A system for detecting and organizing duplicate files using SHA-256 hashing.', 
        model: 'duplicate'
    }
];

const projectList = document.getElementById('project-list');
projectList.innerHTML = projectsData.map((p, i) => `
    <button data-index="${i}" class="project-item text-left w-full p-3 rounded-md hover:bg-white/10 ${i === 0 ? 'bg-white/10' : ''}">
        <h4 class="font-bold text-lg text-purple-300">${p.title}</h4>
        <p class="text-sm text-gray-400">${p.tags.join(', ')}</p>
    </button>`).join('');

let projectScene, projectCamera, projectRenderer, projectModel;

function initProjectScene() {
    projectScene = new THREE.Scene();
    const container = document.getElementById('project-visual');
    projectCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 100);
    projectCamera.position.z = 2;
    projectRenderer = new THREE.WebGLRenderer({ canvas: document.getElementById('project-canvas'), antialias: true, alpha: true });
    projectRenderer.setSize(container.clientWidth, container.clientHeight);
    projectScene.add(new THREE.AmbientLight(0xffffff, 0.5));
    animateProjectScene();
}

function animateProjectScene() {
    if (projectScene) {
        requestAnimationFrame(animateProjectScene);
        if (projectModel) {
            projectModel.rotation.x += 0.005;
            projectModel.rotation.y += 0.005;
        }
        projectRenderer.render(projectScene, projectCamera);
    }
}

function updateProjectView(project) {
    if (!projectScene) initProjectScene();

    if (projectModel) projectScene.remove(projectModel);
    
    const mat = new THREE.LineBasicMaterial({ color: 0xa855f7 });
    let geo;

    if (project.model === 'duplicate') {
        projectModel = new THREE.Group();
        const docGeo = new THREE.BoxGeometry(0.8, 1, 0.05); 
        const wireframe1 = new THREE.LineSegments(new THREE.WireframeGeometry(docGeo), mat);
        wireframe1.position.set(-0.1, 0.1, 0);
        const wireframe2 = new THREE.LineSegments(new THREE.WireframeGeometry(docGeo), mat);
        wireframe2.position.set(0.1, -0.1, 0);
        projectModel.add(wireframe1);
        projectModel.add(wireframe2);
    } else if (project.model === 'asteroid') {
        geo = new THREE.IcosahedronGeometry(0.8, 1);
        const vertices = geo.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const v = new THREE.Vector3(vertices[i], vertices[i+1], vertices[i+2]);
            const bump = 0.8 + Math.random() * 0.4;
            v.normalize().multiplyScalar(bump); 
            vertices[i] = v.x;
            vertices[i+1] = v.y;
            vertices[i+2] = v.z;
        }
        geo.attributes.position.needsUpdate = true; 
        projectModel = new THREE.LineSegments(new THREE.WireframeGeometry(geo), mat);
    } else if (project.model === 'reticle') {
        projectModel = new THREE.Group();
        const ringGeo = new THREE.RingGeometry(0.7, 0.8, 32);
        const ring = new THREE.LineSegments(new THREE.WireframeGeometry(ringGeo), mat);
        const crosshairPoints = [
            new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0.5, 0),
            new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, -0.5, 0),
            new THREE.Vector3(1, 0, 0), new THREE.Vector3(0.5, 0, 0),
            new THREE.Vector3(-1, 0, 0), new THREE.Vector3(-0.5, 0, 0)
        ];
        const crosshairGeo = new THREE.BufferGeometry().setFromPoints(crosshairPoints);
        const crosshairs = new THREE.LineSegments(crosshairGeo, mat);
        projectModel.add(ring);
        projectModel.add(crosshairs);
    } else if (project.model === 'equalizer') {
        projectModel = new THREE.Group();
        const bar1Geo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
        const bar1 = new THREE.LineSegments(new THREE.WireframeGeometry(bar1Geo), mat);
        bar1.position.set(-0.4, -0.2, 0);

        const bar2Geo = new THREE.BoxGeometry(0.2, 1.2, 0.2);
        const bar2 = new THREE.LineSegments(new THREE.WireframeGeometry(bar2Geo), mat);

        const bar3Geo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const bar3 = new THREE.LineSegments(new THREE.WireframeGeometry(bar3Geo), mat);
        bar3.position.set(0.4, -0.3, 0);

        projectModel.add(bar1);
        projectModel.add(bar2);
        projectModel.add(bar3);
    } else {
        switch(project.model) {
            case 'diamond': 
                geo = new THREE.OctahedronGeometry(0.7, 0); 
                geo.scale(1, 1.5, 1);
                break;
            default: 
                geo = new THREE.BoxGeometry(1, 1, 1);
        }
        projectModel = new THREE.LineSegments(new THREE.WireframeGeometry(geo), mat);
    }
    
    projectScene.add(projectModel);

    document.getElementById('project-title').textContent = project.title;
    document.getElementById('project-description').textContent = project.description;
    document.getElementById('project-tags').innerHTML = project.tags.map(t => `<span class="bg-purple-900/50 text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-full">${t}</span>`).join('');
}

projectList.addEventListener('click', (e) => {
    const button = e.target.closest('.project-item');
    if(button) {
        document.querySelectorAll('.project-item').forEach(btn => btn.classList.remove('bg-white/10'));
        button.classList.add('bg-white/10');
        updateProjectView(projectsData[button.dataset.index]);
    }
});
updateProjectView(projectsData[0]);

// --- SKILLS SECTION ---
const skillsCanvas = document.getElementById('skills-canvas');
let skillsCtx, skillNodes = [], skillsMouse = { x: undefined, y: undefined }, skillsAnimationId;

if (skillsCanvas) {
    skillsCtx = skillsCanvas.getContext('2d');
}

const skillsData = [
    { id: 'python', name: 'Python', category: 'Languages', related: ['flask', 'fastapi', 'oop'] },
    { id: 'cpp', name: 'C++', category: 'Languages', related: ['oop'] },
    { id: 'java', name: 'Java', category: 'Languages', related: ['oop'] },
    { id: 'js', name: 'JavaScript', category: 'Languages', related: ['mern'] },
    { id: 'c', name: 'C', category: 'Languages', related: ['os'] },
    { id: 'sql', name: 'SQL', category: 'Languages', related: ['dbms'] },
    { id: 'html', name: 'HTML', category: 'Languages', related: ['mern'] },
    { id: 'css', name: 'CSS', category: 'Languages', related: ['mern'] },
    { id: 'flask', name: 'Flask', category: 'Frameworks & Libraries', related: ['python', 'rest'] },
    { id: 'fastapi', name: 'FastAPI', category: 'Frameworks & Libraries', related: ['python', 'rest'] },
    { id: 'mern', name: 'MERN Stack', category: 'Frameworks & Libraries', related: ['js', 'rest'] },
    { id: 'rest', name: 'REST APIs', category: 'Frameworks & Libraries', related: ['flask', 'fastapi', 'mern', 'networks'] },
    { id: 'websockets', name: 'WebSockets', category: 'Frameworks & Libraries', related: ['networks'] },
    { id: 'oop', name: 'OOP', category: 'Core CS', related: ['python', 'cpp', 'java'] },
    { id: 'dbms', name: 'DBMS', category: 'Core CS', related: ['sql'] },
    { id: 'os', name: 'Operating Systems', category: 'Core CS', related: ['c'] },
    { id: 'networks', name: 'Computer Networks', category: 'Core CS', related: ['rest', 'websockets'] }
];

function setupSkills() {
    if(!skillsCanvas) return;
    const rect = skillsCanvas.parentElement.getBoundingClientRect();
    skillsCanvas.width = rect.width;
    skillsCanvas.height = rect.height;

    const categories = [...new Set(skillsData.map(s => s.category))];
    const layerCount = categories.length;
    const layerWidth = rect.width / layerCount;

    skillNodes = skillsData.map(skill => {
        const layerIndex = categories.indexOf(skill.category);
        const nodesInLayer = skillsData.filter(s => s.category === skill.category);
        const nodeIndexInLayer = nodesInLayer.findIndex(s => s.id === skill.id);

        return {
            ...skill, 
            x: layerIndex * layerWidth + layerWidth / 2, 
            y: (rect.height / (nodesInLayer.length + 1)) * (nodeIndexInLayer + 1),
            radius: 8, targetRadius: 8,
        }
    });
}

function animateSkills() {
    skillsAnimationId = requestAnimationFrame(animateSkills);
    if(!skillsCtx) return;
    
    skillsCtx.clearRect(0, 0, skillsCanvas.width, skillsCanvas.height);
    let hoveredNode = null;
    
    skillNodes.forEach(node => {
        const dist = skillsMouse.x ? Math.hypot(node.x - skillsMouse.x, node.y - skillsMouse.y) : Infinity;
        if(dist < 30) {
            hoveredNode = node;
        }
    });

    const relatedIds = hoveredNode ? hoveredNode.related : [];

    skillNodes.forEach(node => {
         const isHoveredOrRelated = hoveredNode && (hoveredNode.id === node.id || relatedIds.includes(node.id));
         node.targetRadius = isHoveredOrRelated ? 12 : 6;
         node.radius += (node.targetRadius - node.radius) * 0.1;
    });

    skillNodes.forEach(startNode => {
        startNode.related.forEach(relatedId => {
            const endNode = skillNodes.find(n => n.id === relatedId);
            if (endNode) {
                const isConnected = hoveredNode && (hoveredNode.id === startNode.id || hoveredNode.id === endNode.id);
                skillsCtx.beginPath();
                skillsCtx.moveTo(startNode.x, startNode.y);
                skillsCtx.lineTo(endNode.x, endNode.y);
                skillsCtx.lineWidth = isConnected ? 1.5 : 0.5;
                skillsCtx.strokeStyle = isConnected ? 'rgba(168, 85, 247, 1)' : 'rgba(168, 85, 247, 0.2)';
                skillsCtx.stroke();
            }
        });
    });

    skillNodes.forEach(node => {
        skillsCtx.beginPath();
        skillsCtx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        
        const isHovered = hoveredNode && hoveredNode.id === node.id;
        
        skillsCtx.fillStyle = isHovered ? 'rgba(168, 85, 247, 1)' : 'rgba(255, 255, 255, 0.8)';
        skillsCtx.shadowColor = isHovered ? 'rgba(168, 85, 247, 1)' : 'rgba(255, 255, 255, 0.8)';
        skillsCtx.shadowBlur = 10;
        
        skillsCtx.fill();
        
        const textY = node.y + node.radius + 8;
        
        skillsCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        skillsCtx.textAlign = 'center';
        skillsCtx.textBaseline = 'top';
        skillsCtx.font = "16px Rajdhani";
        skillsCtx.shadowBlur = 0;
        skillsCtx.fillText(node.name, node.x, textY);
        
        if (isHovered) {
            skillsCtx.fillStyle = '#a855f7';
            skillsCtx.font = "bold 18px Rajdhani";
            skillsCtx.fillText(node.name, node.x, textY);
        }
    });
     skillsCtx.shadowBlur = 0;
}

if (skillsCanvas) {
     skillsCanvas.parentElement.addEventListener('mousemove', (e) => {
        const rect = skillsCanvas.getBoundingClientRect();
        skillsMouse.x = e.clientX - rect.left;
        skillsMouse.y = e.clientY - rect.top;
    });
    skillsCanvas.parentElement.addEventListener('mouseleave', () => {
        skillsMouse.x = undefined;
        skillsMouse.y = undefined;
    });
}

ScrollTrigger.create({
    trigger: "#skills-section",
    onEnter: () => {
        setupSkills();
        if (!skillsAnimationId) { animateSkills(); }
    },
    onLeave: () => {
        if (skillsAnimationId) { cancelAnimationFrame(skillsAnimationId); skillsAnimationId = null; }
    },
    onEnterBack: () => {
        setupSkills();
        if (!skillsAnimationId) { animateSkills(); }
    },
    onLeaveBack: () => {
        if (skillsAnimationId) { cancelAnimationFrame(skillsAnimationId); skillsAnimationId = null; }
    }
});