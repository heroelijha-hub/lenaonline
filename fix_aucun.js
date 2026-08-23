const fs = require('fs');

const fixes = [
  ['src/components/admin/ProductForm.tsx', '+ Add un attribut', '+ Add attribute'],
  ['src/components/layout/NotificationBell.tsx', 'Aucune notification', 'No notifications'],
  ['src/components/admin/CategoryTable.tsx', '>Aucun<', '>None<'],
  ['src/components/admin/OrderTable.tsx', 'Aucune commande.', 'No orders.'],
  ['src/components/admin/ReviewTable.tsx', 'Aucun avis pour le moment.', 'No reviews yet.'],
  ['src/components/admin/CouponTable.tsx', 'Aucun coupon.', 'No coupons.'],
  ['src/app/sale/page.tsx', 'Aucune promotion en cours', 'No ongoing promotions'],
  ['src/app/preview/page.tsx', 'Aucune section active.', 'No active sections.'],
  ['src/app/hot/page.tsx', 'Aucun produit populaire pour le moment', 'No popular products yet'],
  ['src/app/admin/(dashboard)/chat/AdminChatClient.tsx', 'Aucun message', 'No messages'],
  ['src/app/admin/(dashboard)/chat/AdminChatClient.tsx', 'Aucune conversation.', 'No conversations.'],
];

const updated = new Set();
for (const [file, search, replace] of fixes) {
  if (!fs.existsSync(file)) { console.log('NOT FOUND:', file); continue; }
  let c = fs.readFileSync(file, 'utf8');
  if (c.includes(search)) {
    c = c.replaceAll(search, replace);
    fs.writeFileSync(file, c);
    updated.add(file);
    console.log('Updated:', file);
  }
}
console.log('Done!');
