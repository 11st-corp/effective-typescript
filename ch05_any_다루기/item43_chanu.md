# 몽키패치보다는 안전한 타입을 사용하기

> JS는 객체와 클래스에 임의의 속성을 추가할 수 있을 만큼 유연하다는 것입니다.

JS에서 사용하는 전역객체인 `window`와 `document`에 속성을 추가하여 전역에서 사용하는 방식으로 구현하기도 한다. 이렇게 런타임 시점에 클래스가 변경되는 것을 몽키패치라고 한다.

```typescript
window.monkey = 'Tamarin';
document.monkey = 'Howler';
```

<br/>

> 심지어 내장된 객체의 프로토타입에도 속성을 추가할 수 있습니다.

```typescript
RegExp.prototype.monkey = 'Capuchin';

console.log(/123/.monkey);
```
- `/123/`의 속성값을 사용하기 위해 wrapper객체가 생성되고, `RegExp`클래스의 프로토타입을 거쳐 `monkey` 속성값을 반환하게 된다. 
- 전역객체, 또는 내장객체의 프로토타입에 속성을 추가할 수 있으나, 이러한 경우 반드시 의도하지 않은 side effect가 발생할 수 있으므로 주의해야한다.

<br/>

> TS에서 문제는 추가된 속성에 대해서는 타입체커가 알지못한다는 것입니다.

```typescript
window.monkey = 'Tamarin'; // 'Window' 타입에 `monkey` 속성이 없습니다.
```

- any 단언문을 사용할 수 있으나, 이 것은 매우 좋지 않은 방법.

<br/>

#### 1. 보강

```typescript
interface Document {
    monkey: string;
}

document.monkey = 'Tamarin';
```

- 기존에 구현되어있는 전역객체의 타입인 `Document` 인터페이스에 보강기법을 통해 `monkey` 타입을 선언할 수 있다.
- 모듈 관점에서 전역으로 사용되기 위해서는 `declare global`을 추가해야한다.
- 보강은 전역으로 적용되기 때문에 `document`객체를 사용하는 모든 영역에 적용되는 문제점이 존재한다. 전역객체를 사용하되, 우리가 원하는 영역에 대해서만 적용할 수 없을까?

<br/>

#### 2. 구체적인 타입 단언문

```typescript
interface MonkeyDocument extends Document {
    monkey: string;
}

(document as MonkeyDocument).monkey = 'Macaque';
```

- `Document` 타입을 건드리지 않고 확장하여 사용할 수 있다. 
- 단언문을 사용하므로, 전역객체를 사용하되 모듈단위의 적용이 가능하다.

<br/>

### 정리하자면,

#### 1. 전역객체를 사용하지 않는 것이 좋다.

#### 2. 써야만 한다면, 구체적인 타입 단언문을 사용하자. 