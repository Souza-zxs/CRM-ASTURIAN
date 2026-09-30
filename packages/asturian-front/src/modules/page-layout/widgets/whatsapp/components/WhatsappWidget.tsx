import { WhatsappCard } from '@/activities/whatsapp/components/WhatsappCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

type WhatsappWidgetProps = {
  widget: PageLayoutWidget;
};

// widget is unused today (no per-widget configuration beyond its type), kept
// for parity with every other widget renderer's props contract.
export const WhatsappWidget = (_props: WhatsappWidgetProps) => {
  return <WhatsappCard />;
};
