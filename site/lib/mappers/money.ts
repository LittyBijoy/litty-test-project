import type { TypedMoney, CentPrecisionMoney } from '@commercetools/platform-sdk';
import type { Money } from '@/lib/types';

export function mapMoney(money: TypedMoney | CentPrecisionMoney | undefined): Money {
  if (!money) return { centAmount: 0, currencyCode: 'USD' };
  return { centAmount: money.centAmount, currencyCode: money.currencyCode };
}
