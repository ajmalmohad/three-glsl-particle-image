import * as THREE from 'three';
import vertexShader from './../shaders/vertex.glsl';
import fragmentShader from './../shaders/fragment.glsl';
import mask from './../images/m.jpg';
import texture1 from './../images/t1.png';
import texture2 from './../images/t2.png';
import gsap from 'gsap';

export default class World {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.camera.position.z = 1000;
        this.scene = new THREE.Scene();

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.point = new THREE.Vector2();

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('container').appendChild(this.renderer.domElement);

        this.textures = [
            new THREE.TextureLoader().load(texture1),
            new THREE.TextureLoader().load(texture2),
        ];
        this.mask = new THREE.TextureLoader().load(mask);

        this.time = 0;
        this.move = -1;
        this.progress = 0;

        this.addMesh();
        this.mouseEffect();
        this.render();
        window.addEventListener('resize', this.resize.bind(this), false);
    }
    mouseEffect() {
        this.test = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2000,2000),
            new THREE.MeshBasicMaterial(),
        )
        let help = document.getElementById('help');

        window.addEventListener('mousewheel', mouseWheelEvent.bind(this));
        window.addEventListener('DOMMouseScroll', mouseWheelEvent.bind(this));
        window.addEventListener('mousemove', mouseMoveEvent.bind(this), false);
        window.addEventListener('mousedown', mouseDownEvent.bind(this), false);
        window.addEventListener('mouseup', mouseUpEvent.bind(this), false);
        function mouseWheelEvent(e) {
            var delta = e.wheelDelta ? e.wheelDelta : -e.detail;
            if (delta < 0) {
                delta = -(delta / delta);
            } else {
                delta = delta / delta;
            }
            this.move += delta;
            if(this.move >= -1){
                this.move = -1;
                help.textContent = "Scroll Down";
            }
            if(this.move <= -2){
                this.move = -2;
                help.textContent = "Scroll Up";
            }
            gsap.to(this.material.uniforms.move,{
                duration:0.5,
                value:this.move,
            });
            var progress = gsap.timeline();
            progress.to(this.material.uniforms.transition,{
                duration:1,
                value:1,
            });
            progress.to(this.material.uniforms.transition,{
                duration:1,
                value:0,
            });
        }
        function mouseMoveEvent(e) {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera( this.mouse, this.camera );
            let intersects = this.raycaster.intersectObjects( [this.test] );
            if(intersects[0]){
                this.point.x = intersects[0].point.x;
                this.point.y = intersects[0].point.y;
            }
        }
        function mouseDownEvent(e){
            gsap.to(this.material.uniforms.mousePressed,{
                duration:1,
                value:1,
                ease:"elastic.out(1,0.3)",
            })
        }
        function mouseUpEvent(e){
            gsap.to(this.material.uniforms.mousePressed,{
                duration:1,
                value:0,
                ease:"elastic.out(1,0.3)",
            })
        }
    }
    addMesh() {
        this.material = new THREE.ShaderMaterial({
            fragmentShader,
            vertexShader,
            uniforms: {
                progress: { type: "f", value: 0 },
                t1: { type: "t", value: this.textures[0] },
                t2: { type: "t", value: this.textures[1] },
                mask: { type: "t", value: this.mask },
                move: { type: "f", value: -1 },
                time: { type: "f", value: 0 },
                mouse: { type: "v2", value: null },
                mousePressed: { type: "f", value: 0 },
                transition: { type: "f", value: 0 },
            },
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });
        let number = 512 * 512;
        this.geometry = new THREE.BufferGeometry();
        this.positions = new THREE.BufferAttribute(new Float32Array(number * 3), 3);
        this.coordinates = new THREE.BufferAttribute(new Float32Array(number * 3), 3);
        this.speed = new THREE.BufferAttribute(new Float32Array(number), 1);
        this.offset = new THREE.BufferAttribute(new Float32Array(number), 1);
        this.direction = new THREE.BufferAttribute(new Float32Array(number), 1);
        this.press = new THREE.BufferAttribute(new Float32Array(number), 1);

        let index = 0;
        for (let i = 0; i < 512; i++) {
            let posX = i - 256;
            for (let j = 0; j < 512; j++) {
                let posY = j - 256;
                this.positions.setXYZ(index, posX * 2, posY * 2, 0);
                this.coordinates.setXYZ(index, i, j, 0);
                this.speed.setX(index, rand(0.4, 1));
                this.offset.setX(index, rand(-1000, 1000));
                this.direction.setX(index, Math.random()>0.5?1:-1);
                this.press.setX(index, rand(0.4, 1));
                index++;
            }
        }

        this.geometry.setAttribute("position", this.positions);
        this.geometry.setAttribute("aCoordinates", this.coordinates);
        this.geometry.setAttribute("aOffset", this.speed);
        this.geometry.setAttribute("aSpeed", this.offset);
        this.geometry.setAttribute("aDirection", this.direction);
        this.geometry.setAttribute("aPress", this.press);

        this.mesh = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.mesh);
    }
    render() {
        this.time++;
        let next = (Math.floor(this.move +40))%2;
        let prev = (Math.floor(this.move) +1 +40)%2;
        this.material.uniforms.t1.value = this.textures[prev];
        this.material.uniforms.t2.value = this.textures[next];
        this.material.uniforms.time.value = this.time;
        this.material.uniforms.mouse.value = this.point;
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

let world = new World()


//Utilities
function rand(a, b) {
    return a + (b - a) * Math.random();
}