# 의존성 분리를 위해 미러 타입 사용하기

node js를 사용하여 구현한 `parseCSV` 함수
```typescript
function parseCSV(contents: string | Buffer): {[column: string]: string} {
    if(typeof contents === 'object') {
        return pasrseCSV(contents.toString('utf-8'));
    }
}
```

- 해당 함수의 인자로 사용되는 타입 `Buffer`는 node js 라이브러리에서 제공하는 타입 선언을 devDependencies에 의존성을 추가해야한다.   
  `npm install --save-dev @types/node `

- `Buffer` 타입을 위해 의존성을 추가하게 되면, typescript를 사용하지 않는 개발자, Nodejs를 사용하지 않고 단순히 해당 함수만을 사용하는 개발자 모두 필요하지 않은 타입 선언들이다.
    **즉, 쓸데없이 너무 많이 들고 온다는 것이다.** 

<br/>

### 구조적 타이핑을 적용, 실제 필요한 타입만을 선언하여 사용하는 방식으로 구현한다.

> 구조적 타이핑 - 객체 내의 속성을 모두 가지고 있다면, 해당 객체의 타입을 만족한다. 즉, 속성의 유무가 타입의 동일성을 판단하는 기준이 된다. 

```typescript
interface Vector2D {
    x: number;
    y: number;
}

function length(v: Vector2D) {
    return v.x * v.y;
}


interface NamedVector {
    name: string;
    x: number;
    y: number;
}

interface Vector3D {
    x: number;
    y: number;
    z: number;
}
```

- `NamedVector`, `Vector3D` 모두 `Vector2D`의 속성을 모두 포함하기 때문에 둘 모두 `Vector2D`에 포함되며, 타입이 될 수 있다.
- `NamedVector`, `Vector3D` 타입의 객체 모두 `length` 함수를 사용할 수 있다.

<br/>

### 이러한 특성을 사용하여 기존의 라이브러리에서 제공하는 타입인 `Buffer`를 포함하는 **새로운 미러 타입**을 선언하여 사용한다.

```typescript
interface CsvBuffer {
    toString(encoding: string) : string;
}

function parseCSV(contents: string | CsvBuffer): {[column: string]: string} {
    if(typeof contents === 'object') {
        return pasrseCSV(contents.toString('utf-8'));
    }
}
```
- `Buffer` 대신 우리가 새롭게 선언한 `CsvBuffer`를 사용하였다. 
- 추후에 node js 개발자가 `Buffer`를 사용하는 경우, `Buffer` 타입 또한 `toString` 속성을 가지고 있으므로 `CsvBuffer` 타입에 포함되며 마찬가지로 `parseCSV` 함수를 사용할 수 있게 된다.  
  ```parseCSV(new Buffer('wowowowo'))```


<br/>

### 정리하자면,

#### 1. 라이브러리의 타입 선언 전체가 필요하지 않는 경우, 필요한 선언부만 추출하여 작성 중인 라이브러리에 넣는 것(미러링)을 고려해보는 것이 좋다. 

#### 2. 라이브러리의 타입 선언 대부분을 사용한다면 그냥 의존성을 추가하자.
