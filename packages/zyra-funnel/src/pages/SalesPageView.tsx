import { type FunnelSalesPageContent } from '@/types/FunnelPageContent';

type SalesPageViewProps = {
  content: FunnelSalesPageContent;
};

export const SalesPageView = ({ content }: SalesPageViewProps) => {
  return (
    <main className="page page--sales">
      <h1>{content.headline}</h1>

      {content.valueStack.length > 0 && (
        <section className="value-stack">
          {content.valueStack.map((item, index) => (
            <div className="value-stack-item" key={index}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <span className="perceived-value">{item.perceivedValue}</span>
            </div>
          ))}
        </section>
      )}

      <p className="price">{content.price}</p>
      <p className="guarantee">{content.guaranteeText}</p>

      {content.faq.length > 0 && (
        <section className="faq">
          <h2>Perguntas frequentes</h2>
          {content.faq.map((item, index) => (
            <details key={index}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      )}

      <a href={content.checkoutUrl} className="button">
        {content.ctaLabel}
      </a>
    </main>
  );
};
