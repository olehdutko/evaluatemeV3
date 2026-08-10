import { AccessCode } from '../../../src/entities/access-code.entity';
import { CreditSetting } from '../../../src/entities/credit-setting.entity';
import { EmailTemplate } from '../../../src/entities/email-template.entity';
import { LandingAd, LandingAdPosition } from '../../../src/entities/landing-ad.entity';
import { Order, OrderStatus } from '../../../src/entities/order.entity';
import { AccessCodeStatus } from '../../../src/entities/status.enums';

describe('Supporting entities', () => {
  it('constructs an access code', () => {
    const accessCode: AccessCode = {
      id: 'code-1',
      code: 'ABC123',
      companyId: 'company-1',
      testId: 'test-1',
      status: AccessCodeStatus.ACTIVE,
      expiresAt: null,
      usedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(accessCode.status).toBe('active');
  });

  it('constructs an order', () => {
    const order: Order = {
      id: 'order-1',
      orderNumber: 'ORD-0001',
      userId: 'user-1',
      amount: 99.99,
      currency: 'USD',
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(order.status).toBe('pending');
  });

  it('constructs an email template', () => {
    const template: EmailTemplate = {
      id: 'tmpl-1',
      name: 'welcome',
      subject: 'Welcome',
      bodyHtml: '<p>Hello</p>',
      bodyText: 'Hello',
      variables: { name: 'string' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(template.variables).toEqual({ name: 'string' });
  });

  it('constructs a landing ad', () => {
    const ad: LandingAd = {
      id: 'ad-1',
      title: 'Promo',
      content: 'Check this out',
      imageUrl: null,
      linkUrl: null,
      position: LandingAdPosition.HOME_TOP,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(ad.position).toBe('home_top');
  });

  it('constructs a credit setting', () => {
    const setting: CreditSetting = {
      id: 'cs-1',
      key: 'personal_credit_price',
      value: '9.99',
      updatedByUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(setting.key).toBe('personal_credit_price');
  });
});
