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
          label: "Commerce Events Provider",
          description: "A description for your Commerce Events provider.",
        },
        events: [
          {
            name: "plugin.sample_event",
            fields: [{ name: "*" }],
            label: "Sample Event",
            description: "Use case description for the event.",
            runtimeActions: ["my-package/handle-sample-event"],
          },
        ],
      },
    ],
    external: [
      {
        provider: {
          label: "External Events Provider",
          description: "A description for your External Events provider.",
        },
        events: [
          {
            name: "be-observer.sample_event",
            label: "Sample Event",
            description: "Use case description for the event.",
            runtimeActions: ["my-package/handle-sample-event"],
          },
        ],
      },
    ],
  },
  webhooks: [
    {
      label: "Sample Webhook",
      description: "A sample Commerce Webhook handler.",
      runtimeAction: "my-package/handle-webhook",
      category: "modification",
      webhook: {
        webhook_method: "plugin.sample.event",
        webhook_type: "after",
        batch_name: "my_app",
        hook_name: "sample_hook",
        method: "POST",
      },
    },
    {
      label: "Sample Webhook with URL",
      description: "A sample Commerce Webhook handler using an explicit URL.",
      category: "modification",
      webhook: {
        webhook_method: "plugin.sample.event",
        webhook_type: "after",
        batch_name: "my_app",
        hook_name: "sample_hook_url",
        method: "POST",
        url: "https://example.com/webhook",
      },
    },
  ],
});
