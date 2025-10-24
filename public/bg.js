const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles=[];
for(let i=0;i<80;i++){
    particles.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*2, dx:(Math.random()-0.5)*0.3, dy:(Math.random()-0.5)*0.3});
}

function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#69c9ff";
    particles.forEach(p=>{
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();
        p.x+=p.dx;
        p.y+=p.dy;
        if(p.x<0||p.x>canvas.width) p.dx*=-1;
        if(p.y<0||p.y>canvas.height) p.dy*=-1;
    });
    requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize",()=>{canvas.width=window.innerWidth; canvas.height=window.innerHeight;});
