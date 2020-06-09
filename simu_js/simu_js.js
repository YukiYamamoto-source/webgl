class Link{
    constructor(m){
        this.Mt  = m;
        this.pos = new THREE.Vector3(200,-200,200);
        this.vec = new THREE.Vector3(0,0,0);
        this.link_f = new THREE.Vector3(0,0,0);

        this.pos_a_0 = [new THREE.Vector3(50,50,50),new THREE.Vector3(-50,-50,50),new THREE.Vector3(50,-50,-50)];
        this.pos_a   = this.pos_a_0.concat();

        this.In      = new THREE.Matrix3();
        this.In.set(5e3, 0., 0.,
                     0.,5e3, 0.,
                     0., 0.,5e3);
        this.invI      = new THREE.Matrix3();
        this.invI.set(1/5e3,   0.,   0.,
                         0.,1/5e3,   0.,
                         0.,   0.,1/5e3);
 
        this.Rot      = new THREE.Matrix3();
        this.Rot.set(Math.cos(0.),0.,-Math.sin(0.),
                               0.,1.,           0.,
                     Math.sin(0.),0., Math.cos(0.));

        this.Rot4      = new THREE.Matrix4();
        this.Rot4.set(Math.cos(0.),0.,-Math.sin(0.),0.,
                                0.,1.,           0.,0.,
                      Math.sin(0.),0., Math.cos(0.),0.,
                                0.,0.,           0.,1.);
        this.omg    = new THREE.Vector3();
        this.link_t = new THREE.Vector3(0.,0.,0.);
        
        this.first_time = 1;
    }

    updata_pos_a(){
        this.link_f = new THREE.Vector3();
        this.link_t = new THREE.Vector3();
        for(let i=0;i<this.pos_a.length;i++)
        {
            this.pos_a[i] = this.pos_a_0[i].clone().applyMatrix3(this.Rot);
            this.pos_a[i] = this.pos_a[i].add(this.pos);
        }
    }

    update_phis(){
        var  a   = this.link_f.multiplyScalar(1/this.Mt).add(g);
        this.vec = this.vec.addScaledVector(a,T);
        this.pos = this.pos.addScaledVector(this.vec,T);

        var tmp_omg = this.omg.clone();
        var tmp_tau = this.link_t.clone();
        var RT      = this.Rot.clone().transpose();
        var RTomg   = tmp_omg.clone().applyMatrix3(RT);
        var RTtau   = tmp_tau.clone().applyMatrix3(RT);

        var acc = this.mul_MatVec(this.In, RTomg);
            acc = RTomg.clone().cross(acc);
            acc = RTtau.clone().add(acc.multiplyScalar(-1));
            acc = this.mul_MatVec(this.invI, acc);
            acc = this.mul_MatVec(this.Rot, acc);

        this.omg  = this.omg.addScaledVector(acc,T);
        var omgT  = this.omg.clone().multiplyScalar(T);
        
        if(0){//自前で作成した関数を利用して回転行列を更新（どっちを使ってもいい）
            this.Rot4 = this.updateRot(this.Rot4, omgT); 
        }
        else{//THREE.jsの関数を利用して回転行列を更新
            var temp = new THREE.Matrix4();
            temp.makeRotationAxis(omgT.clone().normalize(), omgT.length());
            this.Rot4 = temp.multiply(this.Rot4);
        }

        this.Rot.set(this.Rot4.elements[0],this.Rot4.elements[4],this.Rot4.elements[8],
                     this.Rot4.elements[1],this.Rot4.elements[5],this.Rot4.elements[9],
                     this.Rot4.elements[2],this.Rot4.elements[6],this.Rot4.elements[10]);
    }

    mul_MatVec(mat, vec){
        var temp = new THREE.Vector3(mat.elements[0]*vec.x + mat.elements[3]*vec.y + mat.elements[6]*vec.z,
                                     mat.elements[1]*vec.x + mat.elements[4]*vec.y + mat.elements[7]*vec.z,
                                     mat.elements[2]*vec.x + mat.elements[5]*vec.y + mat.elements[8]*vec.z,);
        return temp;
    }

    updateRot(pR, omgT){
        var ang = omgT.length();
        var K   = this.gais(omgT);
        var KR  = K.clone().multiply(pR);
        var KKR = K.clone().multiply(KR);

        KR  = KR.multiplyScalar(Math.sin(ang)/ang);
        KKR = KKR.multiplyScalar(this.cosc(ang));
        pR = this.addMatrix4(pR,KR);
        pR = this.addMatrix4(pR,KKR);
        pR = this.ortho(pR);
        return pR;
    }

    addMatrix4(A, B){
        var temp = new THREE.Matrix4();
        temp.set(A.elements[ 0]+B.elements[ 0],A.elements[ 4]+B.elements[ 4],A.elements[ 8]+B.elements[ 8],A.elements[12]+B.elements[12],
                 A.elements[ 1]+B.elements[ 1],A.elements[ 5]+B.elements[ 5],A.elements[ 9]+B.elements[ 9],A.elements[13]+B.elements[13],
                 A.elements[ 2]+B.elements[ 2],A.elements[ 6]+B.elements[ 6],A.elements[10]+B.elements[10],A.elements[14]+B.elements[14],
                 A.elements[ 3]+B.elements[ 3],A.elements[ 7]+B.elements[ 7],A.elements[11]+B.elements[11],A.elements[15]+B.elements[15]);
        return temp;
    }

    cosc(x){
        return (1-Math.cos(x))/x**2
    }

    gais(omgT){
        var temp = new THREE.Matrix4();
        temp.set(      0, -omgT.z,  omgT.y, 0,
                  omgT.z,       0, -omgT.x, 0,
                 -omgT.y,  omgT.x,       0, 0,
                       0,       0,       0, 0);
        return temp;
    }

    //グランシュミットの正規直行化（４次元行列用）
    ortho(pmat){
        var temp = pmat.clone();
        var a = 1./Math.sqrt(temp.elements[0]**2+temp.elements[1]**2+temp.elements[2]**2+temp.elements[3]**2);
        var n00 = temp.elements[0]*a;
        var n10 = temp.elements[1]*a;
        var n20 = temp.elements[2]*a;
        var n30 = temp.elements[3]*a;

              a = n00*temp.elements[4]+n10*temp.elements[5]+n20*temp.elements[6]+n30*temp.elements[7];
        var n01 = temp.elements[4] - a*n00;
        var n11 = temp.elements[5] - a*n10;
        var n21 = temp.elements[6] - a*n20;
        var n31 = temp.elements[7] - a*n30;

          a  = 1./Math.sqrt(n01**2+n11**2+n21**2+n31**2);
        n01 *= a;
        n11 *= a;
        n21 *= a;
        n31 *= a;

            a = n00*temp.elements[8]+n10*temp.elements[9]+n20*temp.elements[10]+n30*temp.elements[11];
        var b = n01*temp.elements[8]+n11*temp.elements[9]+n21*temp.elements[10]+n31*temp.elements[11];
        var n02 = temp.elements[ 8] - a*n00 - b*n01;
        var n12 = temp.elements[ 9] - a*n10 - b*n11;
        var n22 = temp.elements[10] - a*n20 - b*n21;
        var n32 = temp.elements[11] - a*n30 - b*n31;

        a  = 1./Math.sqrt(n02**2+n12**2+n22**2+n32**2);
        n02 *= a;
        n12 *= a;
        n22 *= a;
        n32 *= a;

              a = n00*temp.elements[12]+n10*temp.elements[13]+n20*temp.elements[14]+n30*temp.elements[15];
              b = n01*temp.elements[12]+n11*temp.elements[13]+n21*temp.elements[14]+n31*temp.elements[15];
        var   c = n01*temp.elements[12]+n11*temp.elements[13]+n21*temp.elements[14]+n31*temp.elements[15];
        var n03 = temp.elements[12] - a*n00 - b*n01 - c*n02;
        var n13 = temp.elements[13] - a*n10 - b*n11 - c*n12;
        var n23 = temp.elements[14] - a*n20 - b*n21 - c*n22;
        var n33 = temp.elements[15] - a*n30 - b*n31 - c*n32;

        a  = 1./Math.sqrt(n03**2+n13**2+n23**2+n33**2);
        n03 *= a;
        n13 *= a;
        n23 *= a;
        n33 *= a;

        return temp.set(n00,n01,n02,n03,
                        n10,n11,n12,n13,
                        n20,n21,n22,n23,
                        n30,n31,n32,n33);
    }

    get GetPos(){
        return this.pos.clone();
    }

    get GetVec(){
        return this.vec.clone();
    }

    GetPosA(i){
        return this.pos_a[i].clone();
    }
}


class simulator{
    constructor(){
        this.box1 = new Link(10);

        // サイズを指定
        const width = window.innerWidth;
        const height = window.innerHeight;

        // レンダラーを作成
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( width*0.5, height*0.5 );
        this.c = document.getElementById('canvas');
        this.c.width = 800;
        this.c.height = 800;
        this.c.appendChild( this.renderer.domElement );

        // シーンを作成
        this.scene = new THREE.Scene();

        // カメラを作成
        this.camera = new THREE.PerspectiveCamera(45, width / height);
        this.camera.position.set(0, 0, 1000);

        // 箱を作成
        var geometry_box = new THREE.BoxGeometry(100, 100, 100);
        var material_box = new THREE.MeshNormalMaterial();
        this.box = new THREE.Mesh(geometry_box, material_box);
        this.scene.add(this.box);

        var material_line = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 5
        });
        var points = [];
        points.push( new THREE.Vector3(0,0,0) );
        points.push( this.box1.GetPosA(0) );
        var geometry_line1 = new THREE.BufferGeometry().setFromPoints( points );
        this.line1 = new THREE.Line(geometry_line1, material_line);
        this.scene.add( this.line1 );

        var geometry_line2 = new THREE.BufferGeometry().setFromPoints( points );
        this.line2 = new THREE.Line(geometry_line2, material_line);
        this.scene.add( this.line2 );

        var dir    = new THREE.Vector3();
        var origin = new THREE.Vector3();
        var length = 0.;
        var hex = 0xffff00;

        this.arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
        this.scene.add( this.arrowHelper );
    }
    
    main_loop(){
        var spring1 = new THREE.Vector3( 200,100,0);
        var spring2 = new THREE.Vector3(-200,100,0);
        this.box1.updata_pos_a();
        var vec1 = this.box1.GetPosA(0).add(pre_posA1.multiplyScalar(-1)).multiplyScalar(1/T);
        var vec2 = this.box1.GetPosA(1).add(pre_posA2.multiplyScalar(-1)).multiplyScalar(1/T);

        var F1 = spring1.clone().addScaledVector(this.box1.GetPosA(0),-1);
            F1.multiplyScalar(500).add(vec1.multiplyScalar(-10));
        var F2 = spring2.clone().addScaledVector(this.box1.GetPosA(1),-1);
            F2.multiplyScalar(500).add(vec2.multiplyScalar(-10));

        this.box1.link_f.add(F1);
        this.box1.link_t.add(this.box1.GetPosA(0).add(this.box1.GetPos.multiplyScalar(-1)).cross(F1));
        this.box1.link_f.add(F2);
        this.box1.link_t.add(this.box1.GetPosA(1).add(this.box1.GetPos.multiplyScalar(-1)).cross(F2));
        this.box1.link_f.add(apply_F);
        this.box1.link_t.add(this.box1.GetPosA(2).add(this.box1.GetPos.multiplyScalar(-1)).cross(apply_F));


        pre_posA1.copy(this.box1.GetPosA(0));
        pre_posA2.copy(this.box1.GetPosA(1));
        
        var points = [];
        points.push( spring1 );
        points.push( this.box1.GetPosA(0) );
        this.line1.geometry.setFromPoints( points );

        points = [];
        points.push( spring2 );
        points.push( this.box1.GetPosA(1) );
        this.line2.geometry.setFromPoints( points );

        
        this.box1.update_phis();
        this.box.position.copy(this.box1.GetPos);

        this.arrowHelper.position.copy(this.box1.GetPosA(2));
        this.arrowHelper.setLength(apply_F.length()/1000.);
        this.arrowHelper.setDirection(apply_F.clone().normalize());

        this.box.setRotationFromMatrix(this.box1.Rot4);
        this.renderer.render(this.scene, this.camera);
    }
}

function reset_force(){
    apply_F = new THREE.Vector3(0,0,0);
}

function add_force(x,y,z){
    apply_F.add(new THREE.Vector3(x,y,z));
}

document.body.addEventListener('keydown',
    event => {
        if (event.key === 'q') {
            reset_force();
        }
    });

// ページの読み込みを待つ
var T = 0.001;
var g = new THREE.Vector3(0, -9810., 0);
var pre_posA1 = new THREE.Vector3();
var pre_posA2 = new THREE.Vector3();
var apply_F   = new THREE.Vector3(100,80000,100);
window.addEventListener('load', function(){
    document.getElementById( "X" ).onmousedown = function(){
        $intervalID = setInterval(function(){add_force(1000,0,0);}, 20);
    };
    document.getElementById( "X" ).onmouseup = function(){
        clearInterval($intervalID);
    };
    document.getElementById( "X" ).ontouchstart = function(){
        $intervalID = setInterval(function(){add_force(1000,0,0);}, 20);
    };
    document.getElementById( "X" ).ontouchend = function(){
        clearInterval($intervalID);
    };
    document.getElementById( "Y" ).onmousedown = function(){
        $intervalID = setInterval(function(){add_force(0,1000,0);}, 20);
    };
    document.getElementById( "Y" ).onmouseup = function(){
        clearInterval($intervalID);
    };
    document.getElementById( "Y" ).ontouchstart = function(){
        $intervalID = setInterval(function(){add_force(0,1000,0);}, 20);
    };
    document.getElementById( "Y" ).ontouchend = function(){
        clearInterval($intervalID);
    };
    document.getElementById( "Z" ).onmousedown = function(){
        $intervalID = setInterval(function(){add_force(0,0,1000);}, 20);
    };
    document.getElementById( "Z" ).onmouseup = function(){
        clearInterval($intervalID);
    };
    document.getElementById( "Z" ).ontouchstart = function(){
        $intervalID = setInterval(function(){add_force(0,0,1000);}, 20);
    };
    document.getElementById( "Z" ).ontouchend = function(){
        clearInterval($intervalID);
    };
    document.getElementById( "Xctrl" ).onmousedown = function(){
        $intervalID = setInterval(function(){add_force(-1000,0,0);}, 20);
    };
    document.getElementById( "Xctrl" ).onmouseup = function(){
        clearInterval($intervalID);
    };
    document.getElementById( "Xctrl" ).ontouchstart = function(){
        $intervalID = setInterval(function(){add_force(-1000,0,0);}, 20);
    };
    document.getElementById( "Xctrl" ).ontouchend = function(){
        clearInterval($intervalID);
    };
    document.getElementById( "Yctrl" ).onmousedown = function(){
        $intervalID = setInterval(function(){add_force(0,-1000,0);}, 20);
    };
    document.getElementById( "Yctrl" ).onmouseup = function(){
        clearInterval($intervalID);
    };
    document.getElementById( "Yctrl" ).ontouchstart = function(){
        $intervalID = setInterval(function(){add_force(0,-1000,0);}, 20);
    };
    document.getElementById( "Yctrl" ).ontouchend = function(){
        clearInterval($intervalID);
    };
    document.getElementById( "Zctrl" ).onmousedown = function(){
        $intervalID = setInterval(function(){add_force(0,0,-1000);}, 20);
    };
    document.getElementById( "Zctrl" ).onmouseup = function(){
        clearInterval($intervalID);
    };
    document.getElementById( "Zctrl" ).ontouchstart = function(){
        $intervalID = setInterval(function(){add_force(0,0,-1000);}, 20);
    };
    document.getElementById( "Zctrl" ).ontouchend = function(){
        clearInterval($intervalID);
    };
    SIM=new simulator;
});

window.setInterval(function(){SIM.main_loop()}, T*1000);