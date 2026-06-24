import { defineConfig } from "@adobe/aio-commerce-lib-app/config";

export default defineConfig({
  metadata: {
    id: "benjie-cmrce-extension",
    displayName: "benjie-cmrce-extension",
    version: "1.0.0",
    description:
      "A custom Adobe Commerce application. Fill description for your app.",
  },
  adminUiSdk: {
    registration: {
      menuItems: [
        {
          id: 'order_enrichment_admin::apps',
          title: 'Order Enrichment',
          isSection: true,
          sortOrder: 100,
        },
        {
          id: 'order_enrichment_admin::enriched_orders',
          title: 'Enriched Orders',
          parent: 'order_enrichment_admin::apps',
          sortOrder: 1,
        },
      ],
    },
  },
  businessConfig: {
    schema: [
      {
        type: "list",
        name: "sampleList",
        label: "Sample List",
        selectionMode: "multiple",
        default: ["a"],
        options: [
          { label: "Option A", value: "a" },
          { label: "Option B", value: "b" },
        ],
      },
      {
        type: "text",
        name: "sampleText",
        label: "Sample Text",
        default: "Hello, world!",
      },
    ],
  },
  eventing: {
    commerce: [
      {
        provider: {
          label: "Order Enrichment Events",
          description: "Commerce events for order enrichment processing.",
        },
        events: [
          {
            name: "observer.sales_order_save_after",
            fields: [{ name: "*" }],
            label: "Order Saved",
            description: "Triggered when an order is saved and routed to order-event-consumer.",
            runtimeActions: ["course-labs/order-event-consumer"],
          },
        ],
      },
    ],
  },
});
