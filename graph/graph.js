const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const SIZE_WIDTH = 600;
const SIZE_HEIGHT = 600;
canvas.width = SIZE_WIDTH;
canvas.height = SIZE_HEIGHT;


const VERTEX_RADIUS = 20;
const STROKE_WIDTH = 2;
const STROKE_COLOR = 'black';
const DEFAULT_FILL_COLOR = 'yellow'; //стандартный цвет, в который окрашивается вершина при создании, можно поменять
const EDGE_COLOR = 'blue';
const EDGE_WIDTH = 5;

let addEdjeCounter, first, second;   //эти штуки нужны для добавления ребра

let vertexList = [];    //массив вершин
let adjMatrix = [];     //матрица смежности
let activeMode = 0;     //режим для взаимодействия с canvas

//баг: если пользователь выберет режим добавления ребра, потом выберет 1 вершину
//а после сразу сменит режим, то эта вершина останется выделенной, но при следующем добавлении ребра
//взаимодействия с этой вершиной не будет, короче она просто цвет поменяла


document.getElementById('canvas').addEventListener('click', handler);
document.getElementById('add_vertex').addEventListener('click', event => { activeMode = 1 });
document.getElementById('add_edje').addEventListener('click', event => { addEdjeCounter = 0, first = -1, second = -1, activeMode = 2 });

class Vertex {
    constructor(x, y, name, number) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.number = number;
        this.color = DEFAULT_FILL_COLOR;
    }

    draw() {
        ctx.fillStyle = DEFAULT_FILL_COLOR;
        ctx.strokeStyle = STROKE_COLOR;
        ctx.lineWidth = STROKE_WIDTH;

        ctx.beginPath();
        ctx.arc(this.x, this.y, VERTEX_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        this.drawName();
    }

    redraw(fillColor) {
        this.color = fillColor;

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = STROKE_COLOR;
        ctx.lineWidth = STROKE_WIDTH;

        ctx.beginPath();
        ctx.arc(this.x, this.y, VERTEX_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        this.drawName();
    }

    drawName() {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        ctx.font = 'bold ' + VERTEX_RADIUS + 'px sans-serif';

        ctx.beginPath();
        ctx.fillText(this.name, this.x, this.y);
        ctx.closePath();
    }
}

function handler(event) {
    let x = event.offsetX;
    let y = event.offsetY;

    if (activeMode == 0) {
        //сюда попадаем, если пользователя не выбрал ни один режим на тулбаре и тыкает по canvas
        //вроде как это можно убрать и ничего не изменится (наверное)
    }

    else if (activeMode == 1) {   //режим добавления вершин
        if (isCanAddVertex(x, y)) {
            vertexList.push(new Vertex(x, y, vertexList.length, vertexList.length));
            vertexList[vertexList.length - 1].draw();
            expandAdjMatrix();
        }
    }

    else if (activeMode == 2) { //режим добавления ребра 
        let index = getIndexHitVertex(x, y);

        if (addEdjeCounter == 0) {
            if (index != -1) {
                addEdjeCounter++;
                first = index;
                vertexList[index].redraw('grey');
            }
        }

        else if (addEdjeCounter == 1) {
            if (index != -1) {
                addEdjeCounter++;
                second = index;
                addEdge(first, second);

                activeMode = 0;
            }
        }

        else {
            console.log('ERROR');
        }
    }
}

function addEdge(indexVertex1, indexVertex2) {
    ctx.lineWidth = EDGE_WIDTH;

    ctx.beginPath();
    ctx.moveTo(vertexList[indexVertex1].x, vertexList[indexVertex1].y);
    ctx.lineTo(vertexList[indexVertex2].x, vertexList[indexVertex2].y);
    ctx.stroke();
    ctx.closePath();

    vertexList[indexVertex1].draw();
    vertexList[indexVertex2].draw();

    adjMatrix[vertexList[indexVertex1].number][vertexList[indexVertex2].number] = 1;
    adjMatrix[vertexList[indexVertex2].number][vertexList[indexVertex1].number] = 1;
}

function isCanAddVertex(x, y) {
    if (x > VERTEX_RADIUS && x < SIZE_WIDTH - VERTEX_RADIUS && y > VERTEX_RADIUS && y < SIZE_HEIGHT - VERTEX_RADIUS) {
        let index = getNearestVertexIndex(x, y);

        if (index == -1) {
            return true;
        }

        else if (calculateDistance(vertexList[index].x, vertexList[index].y, x, y) > 2 * VERTEX_RADIUS) {
            return true;
        }
    }
    return false;
}

function getIndexHitVertex(x, y) {
    let index = getNearestVertexIndex(x, y);

    if (index != -1) {
        if (calculateDistance(vertexList[index].x, vertexList[index].y, x, y) < VERTEX_RADIUS) {
            return index;   //попали по вершине
        }
        else {
            return -1;      //не попали по вершине
        }
    }

    else {
        //эта ситуация должна появиться тогда и только тогда, когда пользователь не добавил ни одной вершины,
        //но он пытается что-то выбрать (наверное)
        return index;
    }
}

function getNearestVertexIndex(x, y) {
    let minDistance = -1;
    let index = -1;

    for (let i = 0; i < vertexList.length; i++) {
        let distance = calculateDistance(vertexList[i].x, vertexList[i].y, x, y);

        if (minDistance == -1) {
            index = i;
            minDistance = distance;
        }

        else if (distance < minDistance) {
            index = i;
            minDistance = distance;
        }
    }

    return index;
}

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function expandAdjMatrix() {
    //добавить вершину

    if (adjMatrix.length == 0) { //первая вершина
        adjMatrix.push([0]);
    }

    else {
        let newROW = new Array(adjMatrix.length);
        newROW.fill(0);
        adjMatrix.push(newROW);

        for (let i = 0; i < adjMatrix.length; i++) {
            adjMatrix[i].push(0);
        }
    }
}