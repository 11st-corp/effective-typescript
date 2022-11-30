# 콜백에서 this에 대한 타입 제공하기

일반적인 let, const는 어디서 선언했는지에 따라 상위 스코프를 결정합니다. 이것을 렉시컬 스코프라고 합니다.

그러나 자바스크립트에서 this는 다이나믹 스코프를 따릅니다. 이는 함수가 호출된 형태에 따라 상위 스코프가 정해지는 것을 의미합니다.

### this가 사용되는 예시

```javascript
class C {
  vals = [1, 2, 3];
  logSquares() {
    for (const val of this.vals) {
      console.log(val * val);
    }
  }
}

const c = new C();
c.logSquares();
```

코드를 실행하면 다음과 같은 값이 출력됩니다.

```js
1;
4;
9;
```

이제 앞선 예제를 살짝 변경하여 logSquare를 외부에 넣고 호출하면 어떻게 될까요?

```javascript
class C {
  vals = [1, 2, 3];
  logSquares() {
    for (const val of this.vals) {
      console.log(val * val);
    }
  }
}

const c = new C();
const method = c.logSquares;
method(); // ~~ TypeError: Cannot read property 'vals' of undefined
```

c.logSqaures()가 실제로는 두 가지 작업을 수행합니다.

1. C.prototype.logSquares를 호출
2. this의 값을 c로 바인딩

앞의 코드에서는 logSquares의 참조 변수를 사용함으로써 두 가지 작업을 분리했고, 2번 작업이 없어졌기 때문에 this의 값이 undefined가 됩니다.

this 바인딩을 어떻게 제어할 수 있을까요?
`call` (`apply`, `bind`)을 사용하면 됩니다.

```javascript
const c = new C();
const method = c.logSquares;
method.call(c); // 1, 4, 9 정상 출력
```

(call은 method 함수를 호출하면서 첫 번째 인수로 전달한 c를 호출함 함수의 this에 바인딩합니다.)

this가 반드시 C의 인스턴스에 바인딩 되어야 하는 것은 아니며, 어느 것이든 심지어 DOM에서도 this를 바인딩할 수 있습니다.

### 이벤트 핸들러의 this

예를 들어보겠습니다.

```javascript
document.querySelector('input')!.addEventListener('change',function(e){
  console.log(this); // 이벤트가 발생한 input 엘리먼트를 출력합니다.
})
```

### 콜백 함수의 this

this 바인딩은 종종 콜백 함수에서 쓰입니다. 예를 들어, 클래스 내에 onClick 핸들러를 정의한다면

```javascript
class ResetButton {
  render() {
    return makeButton({ text: 'Reset', onClick: this.onClick });
  }
  onClick() {
    alert(`Reset ${this}`);
  }
}
```

그러나 ResetButton에서 onClick을 호출하면, this 바인딩 문제로 인해 "Reset이 정의되지 않았습니다."라는 경고가 뜹니다.

일반적으로 생성자에서 메서드에 this를 바인딩시켜 해결합니다.

```javascript
class ResetButton {
  constructor() {
    this.onClick = this.onClick.bind(this);
  }
  render() {
    return makeButton({ text: 'Reset', onClick: this.onClick });
  }
  onClick() {
    alert(`Reset ${this}`);
  }
}
```

`onclick(){}`은 `ResetButton.prototype`의 속성을 정의합니다. 그러므로 ResetButton의 모든 인스턴스에서 공유됩니다.

그러나 생성자에서 위와 같이 바인딩하면 onClick 속성에 this가 바인딩되어 해당 인스턴스에 생성됩니다.

속성 탐색 순서에서 onClick 인스턴스 속성은 onClick 프로토타입 앞에 놓이므로, render() 메서드의 `this.onClick`은 바인딩된 함수를 참조하게 됩니다.

더 간단한 방법을 사용해보겠습니다.

```javascript
class ResetButton {
  render() {
    return makeButton({ text: 'Reset', onClick: this.onClick });
  }
  onClick = () => {
    alert(`Reset ${this}`);
  };
}
```

onClick을 화살표함수로 바꿨습니다. 이렇게 되면 ResetButton이 생성될 때마다 제대로 바인딩된 this를 가지는 새 함수를 생성하게 됩니다.

왜냐하면 화살표 함수 내부의 this는 상위 스코프의 this를 가리키기 때문입니다.

(화살표 함수는 함수 자체의 this 바인딩을 갖지 않아서 스코프 체인 상에서 가장 가까운 상위 스코프의 this를 참조)

자바스크립트가 실제로 생성한 코드는 다음과 같습니다.

```javascript
class ResetButton {
  constructor() {
    var _this = this;
    this.onClick = function () {
      alert('Reset' + _this);
    };
  }
  render() {
    return makeButton({ text: 'Reset', onClick: this.onClick });
  }
}
```

### this를 사용하는 콜백 함수

this 바인딩은 자바스크립트의 동작이기 때문에, 타입스크립트 역시 this 바인딩을 그대로 모델링합니다.

만약 작성중인 라이브러리에 this를 사용하는 콜백 함수가 있다면, this 바인딩 문제를 고려해야 합니다.

이 문제는 콜백 함수의 매개변수에 this를 추가하고, 콜백 함수를 call로 호출해서 해결할 수 있습니다.

```typescript
function addkeyListener(
  el: HTMLElement,
  fn: (this: HTMLElement, e: KeyboardEvent) => void
) {
  el.addEventListener('keydown', (e) => {
    fn.call(el, e);
  });
}
```

콜백 함수의 매개변수에 this를 추가하면 this 바인딩이 체크되기 때문에 실수를 방지할 수 있습니다.

```typescript
function addkeyListener(
  el: HTMLElement,
  fn: (this: HTMLElement, e: KeyboardEvent) => void
) {
  el.addEventListener('keydown', (e) => {
    fn(e); // ~~ 'void'형식의 'this' context를
    // 메서드의 'HTMLElement' 형식 'this'에 할당 할 수 없습니다.
  });
}
```

또한 라이브러리 사용자의 콜백 함수에서 this를 참조할 수 있고 완전한 타입 안전성도 얻을 수 있습니다.

```typescript
declare let el: HTMLElement;
addkeyListener(el, function (e) {
  this.innerHTML; // 정상, 'this'는 HTMLElement 타입
});
```

만약 라이브러라 사용자가 콜백을 화살표 함수로 작성하고 this를 참조하려고 하면 타입스크립트가 문제를 잡아냅니다.

```typescript
class Foo {
  registerHandler(el: HTMLElement) {
    addkeyListener(el, (e) => {
      this.innerHTML; // ~~ 'Foo'유형에 'innerHTML' 속성이 없습니다.
    });
  }
}
```

this의 사용법을 반드시 기억해야 합니다. 콜백 함수에서 this 값을 사용해야 한다면 this는 API의 일부가 되는 것이기 때문에 반드시 타입 선언에 포함해야 합니다.

## 요약

- this 바인딩이 동작하는 원리를 이해해야 합니다.
- 콜백 함수에서 this를 사용한다면, 타입 정보를 명시해야 합니다.
