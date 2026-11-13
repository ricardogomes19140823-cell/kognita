FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# CSSs
RUN cp node_modules/shadcn/dist/tailwind.css ./app/shadcn-tailwind.css
RUN cp node_modules/tw-animate-css/dist/tw-animate.css ./app/tw-animate.css

# CRUCIAL: A URL da API precisa estar aqui ANTES do build!
ENV NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start"]
