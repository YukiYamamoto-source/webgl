// ページの読み込みを待つ
window.addEventListener('load', init);

function init() {
    // サイズを指定
    const width  = window.innerWidth;
    const height = window.innerHeight;

    // レンダラーを作成
    const c = document.getElementById('canvas');
    const canv_width  = width-c.offsetLeft*2;
    const canv_height = canv_width/2;
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( canv_width, canv_height);
    renderer.setClearColor(0x000000, 1.0);
    c.width = canv_width;
    c.height = canv_height;
    c.appendChild( renderer.domElement );

    var textMesh;
    var textMesh2;
    var textMesh3;
    var numMesh  = [];
    var numMesh2 = [];
    var numMesh3 = [];
    var lineMesh = [];
    var numline  = 300;

    // シーンを作成
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf9f9f9, 10, 5000);

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(45, canv_width / canv_height, 10,10000);
    
    // カメラコントローラーを作成
    const controls = new THREE.OrbitControls(camera, renderer.domElement );

    // カメラの初期座標を設定
    camera.position.set(0, 100, 0);
    controls.target = new THREE.Vector3(0,100,-1500);
    controls.update();

    var head = 800;
    var dep  = 1500;

    var loader = new THREE.FontLoader();
    loader.load( 'fonts/Nikkyou Sans_Sans.json', function ( font ) {
        var textGeometry = new THREE.TextGeometry("たんじょうび，おめでとう！！！", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        });
        var materials = [
            new THREE.MeshBasicMaterial( { color: 0xff9979 } ),
            new THREE.MeshBasicMaterial( { color: 0x000000 } )
        ];
        textMesh = new THREE.Mesh(textGeometry, materials);
        scene.add(textMesh);
        textMesh.position.set(-head,0,-dep);
        textMesh.visible = false;

        var textGeometry2 = new THREE.TextGeometry("XXXXXX", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        });
        var materials2 = [
            new THREE.MeshBasicMaterial( { color: 0x7bff7c } ),
            new THREE.MeshBasicMaterial( { color: 0x000000 } )
        ];
        textMesh2 = new THREE.Mesh(textGeometry2, materials2);
        scene.add(textMesh2);
        textMesh2.position.set(-head,250,-dep);
        textMesh2.visible = false;

        var textGeometry10 = new THREE.TextGeometry("仕事がんばってるのえらい！", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        });
        var materials10 = [
            new THREE.MeshBasicMaterial( { color: 0x00fa9a } ),
            new THREE.MeshBasicMaterial( { color: 0x000000 } )
        ];
        textMesh10 = new THREE.Mesh(textGeometry10, materials10);
        scene.add(textMesh10);
        textMesh10.rotation.y = 180 * Math.PI / 180;
        textMesh10.position.set(1.7*head,0,1.5*dep);
        textMesh10.visible = false;

        var textGeometry11 = new THREE.TextGeometry("いつもありがとう。", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        });
        var materials11 = [
            new THREE.MeshBasicMaterial( { color: 0x87cefa } ),
            new THREE.MeshBasicMaterial( { color: 0x000000 } )
        ];
        textMesh11 = new THREE.Mesh(textGeometry11, materials11);
        scene.add(textMesh11);
        textMesh11.rotation.y = 90 * Math.PI / 180;
        textMesh11.position.set(-1.8*head,0,1.2*dep);
        textMesh11.visible = false;

        var textGeometry12 = new THREE.TextGeometry("いい１年になりますように！", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        });
        var materials12 = [
            new THREE.MeshBasicMaterial( { color: 0xffa500 } ),
            new THREE.MeshBasicMaterial( { color: 0x000000 } )
        ];
        textMesh12 = new THREE.Mesh(textGeometry12, materials12);
        scene.add(textMesh12);
        textMesh12.rotation.y = -90 * Math.PI / 180;
        textMesh12.position.set(2.1*head,0,-500);
        textMesh12.visible = false;
    } );

    loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
        var textGeometry3 = new THREE.TextGeometry("2020/01/01", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        });
        var materials3 = [
            new THREE.MeshBasicMaterial( { color: 0xf57796 } ),
            new THREE.MeshBasicMaterial( { color: 0x000000 } )
        ];
        textMesh3 = new THREE.Mesh(textGeometry3, materials3);
        scene.add(textMesh3);
        textMesh3.position.set(-800,250,-dep);

        var textGeometry4 = new THREE.TextGeometry("23:59:5  :", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        });
        textMesh4 = new THREE.Mesh(textGeometry4, materials3);
        scene.add(textMesh4);
        textMesh4.position.set(-800,0,-dep);
        
        var textGeometry5 = new THREE.TextGeometry("2020/01/02", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        });
        textMesh5 = new THREE.Mesh(textGeometry5, materials3);
        scene.add(textMesh5);
        textMesh5.position.set(-800,250,-dep);
        textMesh5.visible = false;

        var textGeometry6 = new THREE.TextGeometry("00:00:0  :", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        });
        textMesh6 = new THREE.Mesh(textGeometry6, materials3);
        scene.add(textMesh6);
        textMesh6.position.set(-800,0,-dep);
        textMesh6.visible = false;

        var numGeometry = [new THREE.TextGeometry("0", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        }),
        new THREE.TextGeometry("1", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        }),
        new THREE.TextGeometry("2", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        }),
        new THREE.TextGeometry("3", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        }),
        new THREE.TextGeometry("4", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        }),
        new THREE.TextGeometry("5", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        }),
        new THREE.TextGeometry("6", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        }),
        new THREE.TextGeometry("7", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        }),
        new THREE.TextGeometry("8", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        }),
        new THREE.TextGeometry("9", {
            font: font,
            size: 200,
            height: 50,
            curveSegments: 12
        })];
        for(var i=0;i<10;i++){
            numMesh.push(new THREE.Mesh(numGeometry[i], materials3));
            numMesh2.push(new THREE.Mesh(numGeometry[i], materials3));
            numMesh3.push(new THREE.Mesh(numGeometry[i], materials3));
            scene.add(numMesh[i]);
            scene.add(numMesh2[i]);
            scene.add(numMesh3[i]);
            numMesh[i].position.set(80,0,-dep);
            numMesh2[i].position.set(300,0,-dep);
            numMesh3[i].position.set(450,0,-dep);
            numMesh[i].visible  = false;
            numMesh2[i].visible = false;
            numMesh3[i].visible = false;
        };

        for(var i=0;i<numline;i++){
            const segmentLength = 100;
            const nbrOfPoints = 50;
            const points = [];
            const turbulence = 70;
            for (let j = 0; j < nbrOfPoints; j++) {
            // ! We have to wrapped points into a THREE.Vector3 this time
            points.push(new THREE.Vector3(
                    (Math.random() * (turbulence * 2)) - turbulence,
                    -j * segmentLength,
                    (Math.random() * (turbulence * 2)) - turbulence,
            ));
            };
            // 3D spline
            const linePoints = new THREE.Geometry().setFromPoints(new THREE.CatmullRomCurve3(points).getPoints(400));
        
            const line = new MeshLine();
            line.setGeometry(linePoints);
            const geometry = line.geometry;

            // Build the material with good parameters to animate it.
            var material = new MeshLineMaterial({
                transparent: true,
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.7),
                dashArray: 10,     // always has to be the double of the line
                dashOffset: -Math.random()*2,    // start the dash at zero
                dashRatio: 0.99+Math.random()*0.005,  // visible length range min: 0.99, max: 0.5
                lineWidth: 30
            });

            // Build the Mesh
            lineMesh.push(new THREE.Mesh(geometry, material));
            lineMesh[i].position.set((Math.random()-0.5)*10000,2000,(Math.random()-0.5)*10000);

            // ! Assuming you have your own webgl engine to add meshes on scene and update them.
            scene.add(lineMesh[i]);
            lineMesh[i].visible = false;
        };
    } );

    // 地面
    const grid = new THREE.GridHelper(10000, 50, 0x444444, 0x444444);
    scene.add(grid);

    var time = 0;
    var subtime  = 0;
    var subtime2 = 0;
    var subtime3 = 0;
    window.setInterval(function(){tick()}, 10);

    // 毎フレーム時に実行されるループイベントです
    function tick() {
        if(time<1000){
            // カメラの初期座標を設定
            camera.position.set(0, 100, 0);
            camera.lookAt(new THREE.Vector3(0,100,-1500));
            numMesh [subtime ].visible =false;
            numMesh2[subtime2].visible =false;
            numMesh3[subtime3].visible =false;
            subtime3 += 1;
            if(subtime3==10){ subtime3 = 0; subtime2 += 1; };
            if(subtime2==10){ subtime2 = 0; subtime += 1; };
            if(subtime ==10){ subtime  = 0; };
            numMesh[subtime].visible   =true;
            numMesh2[subtime2].visible =true;
            numMesh3[subtime3].visible =true;
        }
        if(time>=1000 && time<1010){
            textMesh3.visible = false;
            textMesh4.visible = false;
            textMesh5.visible = true;
            textMesh6.visible = true;
        }
        if(time==1010){
            numMesh[subtime].visible   =false;
            numMesh2[subtime2].visible =false;
            numMesh3[subtime3].visible =false;
            textMesh5.visible = false;
            textMesh6.visible = false;

            controls.autoRotate = true;
            controls.autoRotateSpeed = 1.5;
            camera.position.set(0, 200, 0);
            controls.target = new THREE.Vector3(-2000,0,500);
            textMesh.visible  = true;
            textMesh2.visible = true;
            textMesh3.visible = false;
            textMesh4.visible = false;
            textMesh10.visible= true;
            textMesh11.visible= true;
            textMesh12.visible= true;
            scene.background = new THREE.Color( 0xf9f9f9 );
            for(let i=0;i<numline;i++){
                lineMesh[i].visible = true;
            }
        }
        if(time==1400){
            camera.position.set(0, 300, 200);
            controls.target = new THREE.Vector3(0,0,2000);
            controls.autoRotateSpeed = -1.5;
        }
        if(time==1800){
            camera.position.set(0, 200, 0);
            controls.target = new THREE.Vector3(2000,0,500);
            controls.autoRotateSpeed = 1.3;
        }
        if(time==2200){
            controls.autoRotate = false;
            camera.position.set(-900, 400, -390);
            controls.target = new THREE.Vector3(500,0,-2000);
        }
        // Decrement the dashOffset value to animate the path with the dash.
        for(let i=0;i<numline;i++){
            if(lineMesh[i].material.uniforms.dashOffset.value<-2) lineMesh[i].material.uniforms.dashOffset.value = 0;
            lineMesh[i].material.uniforms.dashOffset.value -= 0.002+Math.random()*0.001;
        }      
        controls.update();  
        renderer.render(scene, camera);
        time += 1;
    };
};