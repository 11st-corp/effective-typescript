
# 매핑된 타입을 사용하여 값을 동기화하기

----
<br/>

&nbsp;&nbsp;지금까지 구조적 타이핑 관점에서 TS는 두 객체가 가진 속성의 동일성 여부와 잉여 속성의 여부를 판단하여 객체 형식의 동일 여부를 판단한다고 배웠다. 이번에는 형식이 아니라 객체의 동일성을 판단하는 방식을 배우고자 한다.

> 객체의 동일성을 판단하는 방식을 TS를 이용하여 정의함으로서 객체를 동기화하는 작업을 최적화할 수 있고, 비동기화되는 오류를 잡을 수 있다.

&nbsp;&nbsp;특히 해당 객체가 렌더링에 영향을 주는 경우, 렌더링은 성능에 직결되기 때문에 동일성 여부를 엄격하게 판단하여 필요한 시점에만 동기화되도록 최적화할 필요가 있다. 예제로 산점도를 그리기 위한 UI 컴포넌트를 작성하는 것을 가정하자.

```typescript
interface ScatterProps{
    // Value
    xs: number[];
    ys: number[];
    
    // Display
    xRange: [number, number];
    yRange: [number, number];
    color: string;
    
    // Event
    onClick: (x: number, y: number, index: number) => void;
}
```
- 위에서부터 해당 객체가 가지는 값, 화면 상에 보여지는 범위, 이벤트핸들러의 형식을 정의해두었다. 
- 이 중에서 값과 화면상에 보여지는 범위는 렌더링에 직결되는 속성이다. 그러므로 속성의 값이 변경되면 변경되기 이전의 객체와 동일하지 않다고 판단, 리렌더링을 할 수 있도록 한다.
- 반면, 이벤트 핸들러는 변경되어도 렌더링과는 무관하기 때문에 변경되더라도 이전 객체와 동일하다고 판단, 불필요한 리렌더링을 줄이고자 한다.

<br/>
<br/>

## 1. 실패에 닫힌 접근법

```typescript
function  shouldUpdate(
    oldProps: ScatterProps,
    newProps: ScatterProps
) {
    let k: keyof ScatterProps;
    for (k in oldProps) {
        if(oldProps[k] !== newProps[k]){
            if(k !== 'onClick') return true;
        }
    }
    return false;
}
```

> `onClick` 속성 이외의 모든 속성 값이 변경되게 되면 두 객체가 동일하지 않다고 판단하고 리렌더링을 수행하게 하는 방식이다.

- 기존의 객체가 가지는 모든 속성을 for loop를 통해 돌면서, 속성 값의 일치여부를 확인한다. 이 때, 이벤트 핸들러의 속성명일 때만 예외적으로 일치여부 판단을 넘긴다.
- `onClick`이 아닌 새로운 속성이 추가되면, 해당 속성 값이 변경되어도 리렌더링이 된다. 즉, `onClick`에 대해서만 적용되는 방식이기 때문에 **보수적인** 접근법이라고 볼 수 있다.

<br/>
<br/>

## 2. 실패에 열린 접근법

```typescript
function  shouldUpdate(
    oldProps: ScatterProps,
    newProps: ScatterProps
) {
    oldProps.xs !== newProps.xs ||
    oldProps.ys !== newProps.ys ||
    oldProps.xRange !== newProps.xRange ||
    oldProps.yRange !== newProps.yRange ||
    oldProps.color !== newProps.color ||
}
```

> 렌더링에 직결된 속성 값이 변경되게되면 두 객체가 동일하지 않다고 판단하고 리렌더링을 수행하게 하는 방식이다.

- 기존의 객체가 가진 속성 중, 렌더링에 영향을 주는 속성만 비교, 속성 값의 일치여부를 확인한다. 이 때, 그 이외의 모든 속성에 대해서는 일치여부를 판단하지 않는다.
- `onClick`이 아닌 새로운 속성이 추가되면, 해당 속성 값이 변경되어도 리렌더링이 되지 않는다. 그러므로 **'열려있는'** 접근법이라고 볼 수 있다.
- 하지만 반대로, 렌더링에 영향을 주는 새로운 속성이 추가되었을 때 리렌더링이 되지 않을 수 있다.

<br/>
<br/>

## 3. TS의 타입체커를 사용한 방법

> **핵심은 매핑된 타입과 객체를 사용하는 것입니다.**

```typescript
const REQUIRES_UPDATE: {[k in keyof ScatterProps] : boolean} = {
    xs: true,
    ys: true,
    xRange: true,
    yRange: true,
    color: true,
    onClick: false
}

function  shouldUpdate(
    oldProps: ScatterProps,
    newProps: ScatterProps
) {
    let k: keyof ScatterProps;
    for (k in oldProps) {
        if(oldProps[k] !== newProps[k] && REQUIRES_UPDATE[k]){
            return true;
        }
    }
    return false;
}
```

- 매핑된 타입의 객체 `REQUIRES_UPDATE`은 `[k in keyof ScatterProps]`에 의해 반드시 `ScatterProps`와 동일한 속성을 가지도록 구현되어있다.~~(타입이 맵핑되었다.)~~ 그러므로 속성이 추가되는 경우, 반드시 객체에 명시해야한다. **새로운 속성이 추가되었으나 매핑된 타입에 존재하지 않는 경우 타입체커가 가이드한다.** 
- 매핑된 타입의 객체 `REQUIRES_UPDATE`은 실제 값으로 비교해야하기 때문에 타입이 아닌 boolean 값을 가진 객체로 구현되어 있다.
- `REQUIRES_UPDATE`을 수정함을 통해 속성에 대한 렌더링의 여부를 결정할 수 있다. 렌더링에 직결되는 속성일 경우에는 `true`를, 직결되지 않는 속성은 `false`의 값을 가지도록 하여 새로운 속성이 추가되었을 때 발생하는 모든 문제를 해결할 수 있다.   

<br/>
<br/>

---

### 정리하자면,

#### 인터페이스에 속성을 추가할 때, 속성에 대한 검사여부를 명시하도록 강제하기 위해 매핑된 타입 객체를 고려해야한다.
