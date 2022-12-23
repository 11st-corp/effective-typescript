# 아이템62 마이그레이션의 완성을 위해 noImplicitAny 설정하기

프로젝트를 ts로 전환 후 마지막 단계로 `noImplicitAny`를 설정해줘야 한다.

`noImplicitAny`를 설정함으로써 타입 선언에서 비롯되는 실제 오류를 발견할 수 있기 때문이다.

<br/>

예를 들어, class를 ts로 전환하며 아이템61에서 다룬 quick fix기능 내 `Add all missing members(누락된 모든 멤버 추가)`를 사용했다고 가정해보자

```ts
class Chart {
  indices: any;

  // ...
}
```

`indices` 멤버변수의 타입이 추가되었으나, 문맥정보가 `any`타입으로 추론되었다.

`indices`는 숫자 배열인 것으로 보여 `number[]` 타입으로 수정하고 오류가 사라짐을 확인했다고 가정해보자.

하지만 사실 `indices`는 `number[]`의 타입이 아니었다.

<br/>

실제로 클래스내 다른 부분에 아래와 같은 함수가 있었고

```ts
getRanges() {
  for (const r of this.indices) {
    const low = r[0];    // 타입이 any
    const high = r[1];   // 타입이 any
		// ...
  }
}
```

해당 함수를 보면, `indices`는 `number[]`타입이 아닌 `number[][]` 또는 `[number, number][]`의 타입임을 알 수 있다.

그러나, `indices`가 `number[]`로 선언되어 있기 때문에, `r`은 `number`타입으로 추론된다.

`r`이 `number`타입이지만 배열 인덱스 접근에 오류가 발생하지 않는다는 점이 중요하다.

이처럼 `noImplicitAny`를 설정하지 않으면, 타입 체크가 **허술**해지는 모습을 볼 수 있다.

<br/>

`noImplicitAny`를 설정하면 아래와 같이 오류가 발생하게 되고, 실수한 타입 체크를 확인할 수 있게 된다.

```ts
getRanges() {
  for (const r of this.indices) {
    const low = r[0];    // 'Number' 형식에 인덱스 시그니처가 없으므로 요소에 암시적으로 'any'형식이 있습니다.
    const high = r[1];   // 'Number' 형식에 인덱스 시그니처가 없으므로 요소에 암시적으로 'any'형식이 있습니다.
		// ...
  }
}
```

이처럼 `noImplicitAny`를 사용하면 타입선언과 관련된 실제 오류를 발견할 수 있으나, 처음 마이그레이션을 진행할 때는 `noImplicitAny`를 로컬에만 설정하고 작업하는 것이 좋다. 

왜냐하면, 원격에도 동일하게 `noImplicitAny`를 설정하고 빌드하게 된다면, 빌드가 실패할 것이기 때문에, 로컬에서만 오류로 인식시키고 오류를 하나씩 수정함으로써, **점진적으로 마이그레이션**을 할 수 있기 때문이다.

<br/>

타입체크의 강도를 높이는 설정에는 여러가지가 있는데, `noImplicitAny`는 상당히 엄격한 설정이다.

`strictNullChecks` 같은 설정을 하지 않더라도 대부분의 타입체크를 적용한 것으로 볼 수 있다.

최종적으로 더 강력한 설정도 있는데 `"strict": true`이다.

타입 체크의 강도는 팀 내 모든 사람이 타입스크립트에 익숙해진 다음에 조금씩 높이는 것을 권장한다.