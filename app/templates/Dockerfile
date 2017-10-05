FROM ibmcom/ibmnode

WORKDIR "/app"

# Install app dependencies
COPY . /app
RUN cd /app; npm install; npm prune --production

ENV NODE_ENV production
ENV PORT 3000

EXPOSE 3000
CMD ["npm", "start"]
