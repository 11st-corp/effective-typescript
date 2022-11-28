# 콜백에서 this에 대한 타입 제공하기

일반적인 let, const는 어디서 선언했는지에 따라 상위 스코프를 결정합니다. 이것을 렉시컬 스코프라고 합니다.

그러나 자바스크립트에서 this는 다이나믹 스코프를 따릅니다. 이는 함수가 호출된 형태에 따라 상위 스코프가 정해지는 것을 의미합니다.

this가 사용되는 예시

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
