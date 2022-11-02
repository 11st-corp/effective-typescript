# 아이템 32. 유니온의 인터페이스보다는 인터페이스의 유니온 사용하기

 

```typescript
interface Layer {
  layout: FillLayout | LineLayout | PointLayout;
  paint: FillPaint | LinePaint | PointPaint;
}
```

위 예제에서 `layout`과 `paint`의 타입은 짝이 맞아야 하기에 `layout`이 `LineLayout` 타입이며 `paint`가 `FillPaint` 타입일 수 없습니다. 이런 방식을 허용한다면 오류가 발생하기 쉽고, 인터페이스 다루기도 어려울 것입니다.

`Layer` 인터페이스를 각각 타입 계층을 분리하여 인터페이스로 두어 더 나은 모델링을 할 수 있습니다.

```typescript
interface FillLayer {
  layout: FillLayout;
  paint: FillPaint;
}
interface LineLayuer {
  layout: LineLayout;
  paint: LinePaint;
}
interface PointLayer {
  layout: PointLayout;
  paint: PointPaint;
}
type Layer = FillLayer | LineLayer | PointLayer;
```

위와 같은 형태는 `layout`과 `point` 속성 조합이 잘못되는 것을 방지할 수 있습니다. 이는 아이템 28의 조언인 '유효한 상태만을 표현' 하는 타입 정의 방식입니다. 이 방식을 `태그된 유니온(Tagged Union)`이라 하는데, `태그된 유니온`을 이용하여 속성간의 관계를 명확히 할 수 있습니다.

> **태그된 유니온 (Tagged Union)** 이란
> 상황에 따라 인터페이스를 분리한 후 해당 **인터페이스들을 `type`을 이용하여 유니온으로 사용한 것**
> **태그**는 `type`에 주어진 개별 속성이며 런타임 시 **타입의 범위를 줄일 수 있도록 도와준다**



```typescript
interface FillLayer {
  type: 'fill';
  layout: FillLayout;
  paint: FillPaint;  
}
interface LineLayuer {
  type: 'line';
  layout: LineLayout;
  paint: LinePaint;
}
interface PointLayer {
  type: 'paint';
  layout: PointLayout;
  paint: PointPaint;
}
type Layer = FillLayer | LineLayer | PointLayer;
```

각 `interface`의 `type` 속성은 '태그'이며 런타임에 어떤 타입의 `Layer`가 사용되는지 판단하는 데 쓰입니다. 타입스크립트 이 태그를 참고하여 아래 예제처럼 Layer 타입의 범위를 좁힐 수도 있습니다.



```typescript
function drawLayer(layer: Layer) {
  if(layer.type === 'fill') {
    const { paint, layout } === layer //타입이 FillPaint, FillLayout
  }
  ..
  ..
}
```

이처럼 각 타입 속성 간의 관계를 제대로 모델링하면, 타입스크립트가 코드의 정확성을 체크하는 데 도움이 됩니다. 어떤 데이터 타입을 태그된 유니온으로 표현할 수 있다면, 보통 그렇게 하는 것이 좋습니다. 또는 여러 개의 선택적 필드가 동시에 값이 있거나 동시에 undefined인 경우도 태그된 유니온 패턴이 잘 맞습니다. 

### 문제 : 속성 간의 관계가 잘 표현되지 않음

```typescript
interface Person {
  name: string;
  // 아래 속성은 둘 다 있거나, 둘 다 없음
  placeOfBirth?: string;
  dateOfBirth?: Date;
}
```

인터페이스 내 타입 정보를 담고 있는 주석은 문제가 될 소지가 있기에 지양하는 것이 좋습니다. (아이템 30) 위 인터페이스 내 `placeOfBirth` 와 `dateOfBirth` 필드는 실제로 관련되어 있지만, 어떠한 관계도 표현되지 않았습니다.



### 해결첵: optional 속성을 하나의 객체로 모으기

이때는 두 속성을 하나의 객체로 모으는 것이 더 나은 설계입니다. 이는 `null` 값을 경계로 두는 아이템 31의 방법과 비슷합니다.

```typescript
interface Person {
  name: string;
  // 아래 속성은 둘 다 있거나, 둘 다 없음
  birth?: {
    placeOfBirth?: string;
    dateOfBirth?: Date;
  } 
}
```

### 결과

- `place`만 있고 `date`가 없는 경우에 오류가 발생합니다. 

- `Person` 객체를 매개변수로 받는 경우에는 `birth` 하나만 체크해주면 됩니다.

  ```typescript
  function foo (p: Person) {
    const { birth } = p;
    if (birth) {
      ~~
    }
  }
  ```



타입의 구조를 손 댈 수 없는 상황(예를 들어 API의 결과)이면, 앞서 다룬 인터페이스의 유니온을 사용해서 속성 사이의 관계를 모델링 할 수 있습니다.

```typescript
interface Name {
  name : string;
}

interface PersonWithBirth extends Name {
  placeOfBirth: string;
  dateOfBirth: Date;
}

type Person = Name | PersonWithBirth;
```

이제 중첩된 객체에서도 동일한 효과를 볼 수 있습니다.

```typescript
function foo(p: Person) {
  if ('placeOfBirth' in p) {
    p // PersonWithBirth 타입
    const { dateOfBirth } = p; // Date 타입
  }
}
```



## 결론

- 유니온 타입의 속성을 여러개 가지는 인터페이스는 속성간의 관계가 분명하지 않아 실수가 발생할 수 있다. 
- 타입 정확도 : 유니온의 인터페이스  < 인터페이스의 유니온
- 태그된 유니온은 타입스크립트와 잘 맞는다. 태그된 유니온을 사용해서 타입스크립트가 제어 흐름을 분석할 수 있도록 하자.
