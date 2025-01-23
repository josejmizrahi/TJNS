# Componentes Técnicos del JNS

## 1. JewishID (Sistema de Identidad)

```
+------------------------------------------+
|             JewishID Service              |
+------------------------------------------+
|                                          |
|  +-------------+      +--------------+   |
|  |  KYC/AML    |<---->|  Document     |  |
|  |  Service    |      |  Processor    |  |
|  +-------------+      +--------------+   |
|         ^                   ^            |
|         |                   |            |
|  +-------------+      +--------------+   |
|  |  Identity   |<---->|  IPFS        |  |
|  |  Manager    |      |  Storage     |  |
|  +-------------+      +--------------+   |
|         ^                   ^            |
|         |                   |            |
|  +-------------+      +--------------+   |
|  |  Auth       |<---->|  Blockchain  |  |
|  |  Service    |      |  Bridge      |  |
|  +-------------+      +--------------+   |
|                                          |
+------------------------------------------+

Flujo On-Chain:
- Hashes de documentos
- Estado de verificación
- Credenciales públicas

Flujo Off-Chain:
- Documentos KYC
- Datos personales sensibles
- Verificaciones externas
```

## 2. Token System

```
+------------------------------------------+
|             Token Service                 |
+------------------------------------------+
|                                          |
|  +-------------+      +--------------+   |
|  | ShekelCoin  |<---->|  XRPL        |  |
|  | Manager     |      |  Bridge      |  |
|  +-------------+      +--------------+   |
|         ^                   ^            |
|         |                   |            |
|  +-------------+      +--------------+   |
|  | MitzvahPoint|<---->|  Activity    |  |
|  | Calculator  |      |  Tracker     |  |
|  +-------------+      +--------------+   |
|         ^                   ^            |
|         |                   |            |
|  +-------------+      +--------------+   |
|  | Wallet      |<---->|  Transaction |  |
|  | Manager     |      |  Processor   |  |
|  +-------------+      +--------------+   |
|                                          |
+------------------------------------------+

Flujo On-Chain:
- Transacciones ShekelCoin
- Trust Lines
- Balances MitzvahPoints

Flujo Off-Chain:
- Cálculo de puntos
- Análisis de actividad
- Cache de balances
```

## 3. Governance System

```
+------------------------------------------+
|           Governance Service              |
+------------------------------------------+
|                                          |
|  +-------------+      +--------------+   |
|  | Proposal    |<---->|  Voting      |  |
|  | Manager     |      |  Engine      |  |
|  +-------------+      +--------------+   |
|         ^                   ^            |
|         |                   |            |
|  +-------------+      +--------------+   |
|  | Beit Din    |<---->|  Case        |  |
|  | Virtual     |      |  Manager     |  |
|  +-------------+      +--------------+   |
|         ^                   ^            |
|         |                   |            |
|  +-------------+      +--------------+   |
|  | Forum       |<---->|  Content     |  |
|  | Engine      |      |  Moderator   |  |
|  +-------------+      +--------------+   |
|                                          |
+------------------------------------------+

Flujo On-Chain:
- Votos
- Decisiones Beit Din
- Resultados finales

Flujo Off-Chain:
- Discusiones
- Documentación casos
- Moderación contenido
```

## 4. Genealogy System

```
+------------------------------------------+
|           Genealogy Service               |
+------------------------------------------+
|                                          |
|  +-------------+      +--------------+   |
|  | Tree        |<---->|  Document    |  |
|  | Manager     |      |  Validator   |  |
|  +-------------+      +--------------+   |
|         ^                   ^            |
|         |                   |            |
|  +-------------+      +--------------+   |
|  | NFT         |<---->|  IPFS        |  |
|  | Minter      |      |  Manager     |  |
|  +-------------+      +--------------+   |
|         ^                   ^            |
|         |                   |            |
|  +-------------+      +--------------+   |
|  | Privacy     |<---->|  Access      |  |
|  | Engine      |      |  Control     |  |
|  +-------------+      +--------------+   |
|                                          |
+------------------------------------------+

Flujo On-Chain:
- NFTs genealógicos
- Permisos de acceso
- Hashes documentales

Flujo Off-Chain:
- Documentos familiares
- Metadatos árboles
- Control acceso detallado
```

## 5. Marketplace System

```
+------------------------------------------+
|           Marketplace Service             |
+------------------------------------------+
|                                          |
|  +-------------+      +--------------+   |
|  | Listing     |<---->|  Kosher      |  |
|  | Manager     |      |  Validator   |  |
|  +-------------+      +--------------+   |
|         ^                   ^            |
|         |                   |            |
|  +-------------+      +--------------+   |
|  | Escrow      |<---->|  Payment     |  |
|  | Service     |      |  Processor   |  |
|  +-------------+      +--------------+   |
|         ^                   ^            |
|         |                   |            |
|  +-------------+      +--------------+   |
|  | Rating      |<---->|  Dispute     |  |
|  | System      |      |  Resolution   |  |
|  +-------------+      +--------------+   |
|                                          |
+------------------------------------------+

Flujo On-Chain:
- Pagos ShekelCoin
- Contratos Escrow
- Estados transacciones

Flujo Off-Chain:
- Validación Kosher
- Gestión disputas
- Metadatos productos
```

## 6. Education System

```
+------------------------------------------+
|           Education Service               |
+------------------------------------------+
|                                          |
|  +-------------+      +--------------+   |
|  | Course      |<---->|  Content     |  |
|  | Manager     |      |  Delivery    |  |
|  +-------------+      +--------------+   |
|         ^                   ^            |
|         |                   |            |
|  +-------------+      +--------------+   |
|  | Certificate |<---->|  Achievement |  |
|  | Generator   |      |  Tracker     |  |
|  +-------------+      +--------------+   |
|         ^                   ^            |
|         |                   |            |
|  +-------------+      +--------------+   |
|  | Resource    |<---->|  Payment     |  |
|  | Library     |      |  Handler     |  |
|  +-------------+      +--------------+   |
|                                          |
+------------------------------------------+

Flujo On-Chain:
- Certificados
- Pagos cursos
- Logros verificables

Flujo Off-Chain:
- Contenido educativo
- Progreso estudiantes
- Recursos multimedia
```

## Interacciones Entre Sistemas

```
+----------------+     +----------------+     +----------------+
|   JewishID     |<--->|    Token       |<--->|  Marketplace   |
+----------------+     +----------------+     +----------------+
        ^                      ^                      ^
        |                      |                      |
        v                      v                      v
+----------------+     +----------------+     +----------------+
|  Governance    |<--->|   Genealogy    |<--->|  Education    |
+----------------+     +----------------+     +----------------+

Flujos de Datos Principales:
1. JewishID -> Token: Verificación para operaciones financieras
2. Token -> Marketplace: Procesamiento de pagos y escrow
3. Genealogy -> JewishID: Verificación de relaciones familiares
4. Governance -> Token: Distribución de MitzvahPoints
5. Education -> Token: Pagos y recompensas por logros
6. Marketplace -> Governance: Disputas comerciales para Beit Din
```
