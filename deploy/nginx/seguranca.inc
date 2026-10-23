# Cabeçalhos de segurança (incluídos em cada location: no nginx, um add_header dentro de uma location
# anula os do nível acima). A Content-Security-Policy completa vem na <meta> de cada página, gerada a
# partir de src/config/lodge.ts; aqui ficam as directivas que só funcionam como cabeçalho.
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" always;
add_header Content-Security-Policy "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
