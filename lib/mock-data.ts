import {
  CatalogSummary,
  Cliente,
  Competidor,
  DimCliente,
  DimProducto,
  DimTiempo,
  DimZona,
  HechoPedido,
  LeadInsight,
  Pedido,
  PedidoDetalle,
  PrecioCompetencia,
  PrecioPropio,
  PreviewAmbiente,
  Producto,
} from "./data-models";

export const mockProductos: Producto[] = [
  new Producto({
    idProducto: 1,
    skuInterno: "SOF-ARCO-001",
    nombre: "Sofá Arco Vienna",
    categoria: "living",
    marca: "Vanguarda Studio",
    anchoCm: 260,
    altoCm: 86,
    caracteristicas: [
      "Modulo curvo configurable",
      "Espuma HR 35kg", 
      "Tapiceria antimanchas"
    ],
    acabados: ["Lino crudo", "Bronce cepillado"],
    activo: true,
    fechaCreacion: new Date("2023-07-14"),
    imageUrl: "https://assets.vanguarda.dev/catalog/sofa-arco-vienna.png",
  }),
  new Producto({
    idProducto: 2,
    skuInterno: "MES-NORD-002",
    nombre: "Mesa Nord Tilia",
    categoria: "comedor",
    marca: "Vanguarda Studio",
    anchoCm: 210,
    altoCm: 76,
    caracteristicas: [
      "Cubierta en fresno termo-tratado",
      "Base de aluminio anodizado",
      "Protección nanolacquer"
    ],
    acabados: ["Fresno tostado", "Aluminio grafito"],
    activo: true,
    fechaCreacion: new Date("2023-11-02"),
    imageUrl: "https://assets.vanguarda.dev/catalog/mesa-nord-tilia.png",
  }),
  new Producto({
    idProducto: 3,
    skuInterno: "LAM-LUNA-003",
    nombre: "Lámpara Luna Bronce",
    categoria: "iluminacion",
    marca: "Atelier Andes",
    anchoCm: 42,
    altoCm: 160,
    caracteristicas: [
      "Pantalla opalina flotante",
      "Regulador touch dimmable",
      "Cable textil negro"
    ],
    acabados: ["Bronce oscuro", "Opalino blanco"],
    activo: true,
    fechaCreacion: new Date("2023-05-18"),
    imageUrl: "https://assets.vanguarda.dev/catalog/lampara-luna-bronce.png",
  }),
  new Producto({
    idProducto: 4,
    skuInterno: "SIL-KURO-004",
    nombre: "Silla Kuro Mesh",
    categoria: "oficina",
    marca: "Atelier Andes",
    anchoCm: 58,
    altoCm: 96,
    caracteristicas: [
      "Soporte lumbar 4 posiciones",
      "Mesh técnico respirable",
      "Ruedas silenciosas PU"
    ],
    acabados: ["Acero negro mate", "Mesh grafito"],
    activo: false,
    fechaCreacion: new Date("2022-09-10"),
    imageUrl: "https://assets.vanguarda.dev/catalog/silla-kuro-mesh.png",
  }),
  new Producto({
    idProducto: 5,
    skuInterno: "CMT-TERRA-005",
    nombre: "Comedor Terra 6p",
    categoria: "comedor",
    marca: "Sierra Design",
    anchoCm: 240,
    altoCm: 78,
    caracteristicas: [
      "Perfil orgánico",
      "Sillas tapizadas en bouclé",
      "Incluye bandeja central removible"
    ],
    acabados: ["Nogal tostado", "Boucle beige"],
    activo: true,
    fechaCreacion: new Date("2024-01-12"),
    imageUrl: "https://assets.vanguarda.dev/catalog/comedor-terra.png",
  }),
  new Producto({
    idProducto: 6,
    skuInterno: "BAN-ALBA-006",
    nombre: "Banco Alba Exterior",
    categoria: "exteriores",
    marca: "Sierra Design",
    anchoCm: 180,
    altoCm: 45,
    caracteristicas: [
      "Polímero reciclado",
      "Protección UV 900h",
      "Herrajes inoxidables"
    ],
    acabados: ["Teca quemada", "Acero cepillado"],
    activo: true,
    fechaCreacion: new Date("2024-02-08"),
    imageUrl: "https://assets.vanguarda.dev/catalog/banco-alba-exterior.png",
  }),
];

export const mockPreciosPropios: PrecioPropio[] = [
  new PrecioPropio({
    idPrecio: 101,
    idProducto: 1,
    precio: 1890,
    moneda: "USD",
    fuente: "lista_base",
    fechaInicio: new Date("2024-01-01"),
    fechaFin: new Date("2024-08-31"),
  }),
  new PrecioPropio({
    idPrecio: 102,
    idProducto: 1,
    precio: 1750,
    moneda: "USD",
    fuente: "promo",
    fechaInicio: new Date("2024-09-01"),
  }),
  new PrecioPropio({
    idPrecio: 201,
    idProducto: 2,
    precio: 1420,
    moneda: "USD",
    fuente: "lista_base",
    fechaInicio: new Date("2024-03-10"),
  }),
  new PrecioPropio({
    idPrecio: 202,
    idProducto: 2,
    precio: 1360,
    moneda: "USD",
    fuente: "custom",
    fechaInicio: new Date("2024-10-05"),
  }),
  new PrecioPropio({
    idPrecio: 301,
    idProducto: 3,
    precio: 480,
    moneda: "USD",
    fuente: "lista_base",
    fechaInicio: new Date("2024-02-15"),
  }),
  new PrecioPropio({
    idPrecio: 401,
    idProducto: 4,
    precio: 320,
    moneda: "USD",
    fuente: "lista_base",
    fechaInicio: new Date("2024-01-20"),
    fechaFin: new Date("2024-07-30"),
  }),
  new PrecioPropio({
    idPrecio: 402,
    idProducto: 4,
    precio: 295,
    moneda: "USD",
    fuente: "promo",
    fechaInicio: new Date("2024-08-01"),
  }),
  new PrecioPropio({
    idPrecio: 501,
    idProducto: 5,
    precio: 2100,
    moneda: "USD",
    fuente: "lista_base",
    fechaInicio: new Date("2024-04-18"),
  }),
  new PrecioPropio({
    idPrecio: 601,
    idProducto: 6,
    precio: 890,
    moneda: "USD",
    fuente: "lista_base",
    fechaInicio: new Date("2024-05-25"),
    fechaFin: new Date("2024-09-01"),
  }),
  new PrecioPropio({
    idPrecio: 602,
    idProducto: 6,
    precio: 840,
    moneda: "USD",
    fuente: "promo",
    fechaInicio: new Date("2024-09-02"),
  }),
];

export const mockClientes: Cliente[] = [
  new Cliente({
    idCliente: 10,
    nombreCompleto: "Andes Health Group",
    email: "ventas@andeshealth.bo",
    telefono: "+591 789-12030",
    zona: "Occidente",
    ciudad: "La Paz",
    pais: "Bolivia",
    canalOrigen: "web",
    fechaRegistro: new Date("2023-11-18"),
    imageUrl: "https://assets.vanguarda.dev/clientes/andes-health.png",
  }),
  new Cliente({
    idCliente: 11,
    nombreCompleto: "Retail Nova",
    email: "compras@retailnova.com",
    telefono: "+591 776-55588",
    zona: "Oriente",
    ciudad: "Santa Cruz",
    pais: "Bolivia",
    canalOrigen: "partner",
    fechaRegistro: new Date("2024-02-04"),
    imageUrl: "https://assets.vanguarda.dev/clientes/retail-nova.png",
  }),
  new Cliente({
    idCliente: 12,
    nombreCompleto: "Campus Altamar",
    email: "procurement@altamar.edu",
    telefono: "+591 764-90440",
    zona: "Centro",
    ciudad: "Cochabamba",
    pais: "Bolivia",
    canalOrigen: "referido",
    fechaRegistro: new Date("2024-01-22"),
    imageUrl: "https://assets.vanguarda.dev/clientes/campus-altamar.png",
  }),
  new Cliente({
    idCliente: 13,
    nombreCompleto: "Neu Network",
    email: "infra@neunetwork.io",
    telefono: "+591 781-66552",
    zona: "Oriente",
    ciudad: "Santa Cruz",
    pais: "Bolivia",
    canalOrigen: "web",
    fechaRegistro: new Date("2023-12-10"),
    imageUrl: "https://assets.vanguarda.dev/clientes/neu-network.png",
  }),
  new Cliente({
    idCliente: 14,
    nombreCompleto: "Vox Capital",
    email: "ops@voxcapital.lat",
    telefono: "+591 720-33221",
    zona: "Occidente",
    ciudad: "La Paz",
    pais: "Bolivia",
    canalOrigen: "partner",
    fechaRegistro: new Date("2024-03-14"),
    imageUrl: "https://assets.vanguarda.dev/clientes/vox-capital.png",
  }),
  new Cliente({
    idCliente: 15,
    nombreCompleto: "Selva Hotels",
    email: "expansion@selva.ht",
    telefono: "+591 765-02021",
    zona: "Sur",
    ciudad: "Tarija",
    pais: "Bolivia",
    canalOrigen: "instagram",
    fechaRegistro: new Date("2024-04-06"),
    imageUrl: "https://assets.vanguarda.dev/clientes/selva-hotels.png",
  }),
];

export const mockPedidos: Pedido[] = [
  new Pedido({
    idPedido: 5001,
    idCliente: 10,
    canal: "web",
    estado: "CONFIRMADO",
    montoTotal: 48200,
    moneda: "USD",
    fechaCreacion: new Date("2024-08-02"),
    fechaConfirmacion: new Date("2024-08-05"),
    observaciones: "Instalación escalonada por piso.",
    urlPdfCotizacion: "https://assets.vanguarda.dev/cotizaciones/PO-5001.pdf",
  }),
  new Pedido({
    idPedido: 5002,
    idCliente: 11,
    canal: "partner",
    estado: "PENDIENTE",
    montoTotal: 26800,
    moneda: "USD",
    fechaCreacion: new Date("2024-09-12"),
    observaciones: "Esperando aprobación financiera.",
    urlPdfCotizacion: "https://assets.vanguarda.dev/cotizaciones/PO-5002.pdf",
  }),
  new Pedido({
    idPedido: 5003,
    idCliente: 12,
    canal: "referido",
    estado: "CONFIRMADO",
    montoTotal: 15800,
    moneda: "USD",
    fechaCreacion: new Date("2024-07-22"),
    fechaConfirmacion: new Date("2024-07-29"),
    urlPdfCotizacion: "https://assets.vanguarda.dev/cotizaciones/PO-5003.pdf",
  }),
  new Pedido({
    idPedido: 5004,
    idCliente: 13,
    canal: "web",
    estado: "CANCELADO",
    montoTotal: 9200,
    moneda: "USD",
    fechaCreacion: new Date("2024-05-30"),
    observaciones: "Requisitos de ciberseguridad no aprobados.",
    urlPdfCotizacion: "https://assets.vanguarda.dev/cotizaciones/PO-5004.pdf",
  }),
  new Pedido({
    idPedido: 5005,
    idCliente: 14,
    canal: "catalogo",
    estado: "PENDIENTE",
    montoTotal: 38400,
    moneda: "USD",
    fechaCreacion: new Date("2024-10-03"),
    observaciones: "Incluye fase piloto en Lima.",
    urlPdfCotizacion: "https://assets.vanguarda.dev/cotizaciones/PO-5005.pdf",
  }),
  new Pedido({
    idPedido: 5006,
    idCliente: 15,
    canal: "tienda",
    estado: "CONFIRMADO",
    montoTotal: 22100,
    moneda: "USD",
    fechaCreacion: new Date("2024-09-05"),
    fechaConfirmacion: new Date("2024-09-09"),
    observaciones: "Entrega acelerada para temporada alta.",
    urlPdfCotizacion: "https://assets.vanguarda.dev/cotizaciones/PO-5006.pdf",
  }),
  new Pedido({
    idPedido: 5007,
    idCliente: 13,
    canal: "whatsapp",
    estado: "CONFIRMADO",
    montoTotal: 6400,
    moneda: "USD",
    fechaCreacion: new Date("2024-10-08"),
    fechaConfirmacion: new Date("2024-10-11"),
    observaciones: "Reposición de módulos existentes.",
    urlPdfCotizacion: "https://assets.vanguarda.dev/cotizaciones/PO-5007.pdf",
  }),
];

export const mockPedidoDetalle: PedidoDetalle[] = [
  new PedidoDetalle({
    idDetalle: 1,
    idPedido: 5001,
    idProducto: 1,
    cantidad: 4,
    precioUnitario: 1750,
    precioLista: 1890,
    descuentoPorcentaje: 5,
    subtotal: 7000,
  }),
  new PedidoDetalle({
    idDetalle: 2,
    idPedido: 5001,
    idProducto: 3,
    cantidad: 8,
    precioUnitario: 460,
    precioLista: 480,
    descuentoPorcentaje: 4,
    subtotal: 3680,
  }),
  new PedidoDetalle({
    idDetalle: 3,
    idPedido: 5002,
    idProducto: 2,
    cantidad: 6,
    precioUnitario: 1360,
    precioLista: 1420,
    descuentoPorcentaje: 4,
    subtotal: 8160,
  }),
  new PedidoDetalle({
    idDetalle: 4,
    idPedido: 5002,
    idProducto: 5,
    cantidad: 3,
    precioUnitario: 2100,
    precioLista: 2100,
    descuentoPorcentaje: 0,
    subtotal: 6300,
  }),
  new PedidoDetalle({
    idDetalle: 5,
    idPedido: 5003,
    idProducto: 6,
    cantidad: 10,
    precioUnitario: 840,
    precioLista: 890,
    descuentoPorcentaje: 6,
    subtotal: 8400,
  }),
  new PedidoDetalle({
    idDetalle: 6,
    idPedido: 5004,
    idProducto: 4,
    cantidad: 12,
    precioUnitario: 295,
    precioLista: 320,
    descuentoPorcentaje: 8,
    subtotal: 3540,
  }),
  new PedidoDetalle({
    idDetalle: 7,
    idPedido: 5005,
    idProducto: 1,
    cantidad: 6,
    precioUnitario: 1750,
    precioLista: 1890,
    descuentoPorcentaje: 7,
    subtotal: 10500,
  }),
  new PedidoDetalle({
    idDetalle: 8,
    idPedido: 5005,
    idProducto: 3,
    cantidad: 12,
    precioUnitario: 480,
    precioLista: 480,
    descuentoPorcentaje: 0,
    subtotal: 5760,
  }),
  new PedidoDetalle({
    idDetalle: 9,
    idPedido: 5006,
    idProducto: 2,
    cantidad: 4,
    precioUnitario: 1420,
    precioLista: 1420,
    descuentoPorcentaje: 0,
    subtotal: 5680,
  }),
  new PedidoDetalle({
    idDetalle: 10,
    idPedido: 5006,
    idProducto: 6,
    cantidad: 6,
    precioUnitario: 840,
    precioLista: 890,
    descuentoPorcentaje: 6,
    subtotal: 5040,
  }),
  new PedidoDetalle({
    idDetalle: 11,
    idPedido: 5007,
    idProducto: 3,
    cantidad: 5,
    precioUnitario: 480,
    precioLista: 480,
    descuentoPorcentaje: 0,
    subtotal: 2400,
  }),
];

export const mockLeadInsights: LeadInsight[] = [
  new LeadInsight({
    idLead: 9001,
    idCliente: 10,
    idPedido: 5001,
    comoNosConocio: "LinkedIn",
    motivoCompraTexto: "Modernizar salas VIP de las nuevas clínicas.",
    motivoCompraCategoria: "expansion",
    canalRespuesta: "audio",
    urlAudio: "https://assets.vanguarda.dev/insights/andes-health.ogg",
    fechaRegistro: new Date("2024-07-28"),
  }),
  new LeadInsight({
    idLead: 9002,
    idCliente: 11,
    comoNosConocio: "Partner regional",
    motivoCompraTexto: "Necesitan módulos para Q1 en tiendas flagship.",
    motivoCompraCategoria: "retail_media",
    canalRespuesta: "texto",
    fechaRegistro: new Date("2024-08-15"),
  }),
  new LeadInsight({
    idLead: 9003,
    idCliente: 13,
    idPedido: 5007,
    comoNosConocio: "Referido",
    motivoCompraTexto: "Buscan materiales con retardante para data center.",
    motivoCompraCategoria: "seguridad",
    canalRespuesta: "texto",
    fechaRegistro: new Date("2024-10-01"),
  }),
  new LeadInsight({
    idLead: 9004,
    idCliente: 14,
    comoNosConocio: "Eventos",
    motivoCompraTexto: "Plan de salas ejecutivas en nuevas ciudades.",
    motivoCompraCategoria: "expansion",
    canalRespuesta: "audio",
    fechaRegistro: new Date("2024-10-04"),
  }),
];

export const mockPreviewAmbientes: PreviewAmbiente[] = [
  new PreviewAmbiente({
    idPreview: 900,
    idCliente: 10,
    idProducto: 1,
    urlImagenOriginal: "https://assets.vanguarda.dev/originales/sofa-arco.png",
    urlImagenGenerada: "https://assets.vanguarda.dev/generadas/sofa-arco-loft.png",
    fechaCreacion: new Date("2024-10-02"),
  }),
  new PreviewAmbiente({
    idPreview: 901,
    idCliente: 11,
    idProducto: 3,
    urlImagenOriginal: "https://assets.vanguarda.dev/originales/luna-bronce.png",
    urlImagenGenerada: "https://assets.vanguarda.dev/generadas/luna-bronce-galeria.png",
    fechaCreacion: new Date("2024-09-24"),
  }),
  new PreviewAmbiente({
    idPreview: 902,
    idCliente: 14,
    idProducto: 5,
    urlImagenOriginal: "https://assets.vanguarda.dev/originales/terra-comedor.png",
    urlImagenGenerada: "https://assets.vanguarda.dev/generadas/terra-comedor-botanico.png",
    fechaCreacion: new Date("2024-10-10"),
  }),
];

export const mockCompetidores: Competidor[] = [
  new Competidor({
    idCompetidor: 1,
    nombre: "CasaVerde",
    urlBase: "https://casaverde.lat",
    metodoExtraccion: "scraping_html",
    activo: true,
  }),
  new Competidor({
    idCompetidor: 2,
    nombre: "Loftify",
    urlBase: "https://api.loftify.io",
    metodoExtraccion: "api",
    activo: true,
  }),
  new Competidor({
    idCompetidor: 3,
    nombre: "Atomo Living",
    urlBase: "https://atomoliving.com",
    metodoExtraccion: "scraping_spa",
    activo: false,
  }),
];

export const mockPreciosCompetencia: PrecioCompetencia[] = [
  new PrecioCompetencia({
    idPrecioComp: 7001,
    idCompetidor: 1,
    idProducto: 1,
    skuExterno: "ARCO-CASA-01",
    nombreExterno: "Sofá Arco Premium",
    precio: 1980,
    moneda: "USD",
    urlProducto: "https://casaverde.lat/catalogo/sofa-arco",
    timestamp: new Date("2024-10-12T09:00:00Z"),
  }),
  new PrecioCompetencia({
    idPrecioComp: 7002,
    idCompetidor: 2,
    idProducto: 2,
    skuExterno: "NORD-TILIA-6",
    nombreExterno: "Mesa Nórdica Tilia",
    precio: 1490,
    moneda: "USD",
    urlProducto: "https://api.loftify.io/products/nord-tilia",
    timestamp: new Date("2024-10-13T03:00:00Z"),
  }),
  new PrecioCompetencia({
    idPrecioComp: 7003,
    idCompetidor: 1,
    idProducto: 5,
    skuExterno: "TERRA-CASA-05",
    nombreExterno: "Set Terra Bosque",
    precio: 2190,
    moneda: "USD",
    urlProducto: "https://casaverde.lat/catalogo/terra",
    timestamp: new Date("2024-10-10T11:00:00Z"),
  }),
];

export const mockDimProducto: DimProducto[] = mockProductos.map(
  (producto) =>
    new DimProducto({
      idProducto: producto.idProducto,
      skuInterno: producto.skuInterno,
      categoria: producto.categoria,
      marca: producto.marca,
    }),
);

export const mockDimCliente: DimCliente[] = mockClientes.map(
  (cliente) =>
    new DimCliente({
      idCliente: cliente.idCliente,
      zona: cliente.zona,
      ciudad: cliente.ciudad,
      pais: cliente.pais,
      canalOrigen: cliente.canalOrigen,
    }),
);

const uniqueZonaEntries = Array.from(
  new Map(
    mockClientes.map((cliente) => [
      `${cliente.zona}-${cliente.ciudad}`,
      { zona: cliente.zona, ciudad: cliente.ciudad, pais: cliente.pais },
    ]),
  ).values(),
);

export const mockDimZona: DimZona[] = uniqueZonaEntries.map(
  (entry, index) =>
    new DimZona({
      idZona: index + 1,
      zona: entry.zona,
      ciudad: entry.ciudad,
      pais: entry.pais,
      region: entry.zona.includes("Oriente") ? "Este" : entry.zona.includes("Occidente") ? "Oeste" : "Centro-Sur",
    }),
);

const weekNumber = (date: Date) => {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const uniqueFechas = Array.from(
  new Set(
    mockPedidos.map((pedido) => (pedido.fechaConfirmacion ?? pedido.fechaCreacion).toISOString()),
  ),
).sort();

export const mockDimTiempo: DimTiempo[] = uniqueFechas.map((isoDate, index) => {
  const fecha = new Date(isoDate);
  const mes = fecha.getMonth() + 1;
  return new DimTiempo({
    idTiempo: index + 1,
    fecha,
    anio: fecha.getFullYear(),
    mes,
    semana: weekNumber(fecha),
    trimestre: Math.floor((mes - 1) / 3) + 1,
  });
});

export const mockHechosPedidos: HechoPedido[] = mockPedidoDetalle.map((detalle, index) => {
  const pedido = mockPedidos.find((p) => p.idPedido === detalle.idPedido);
  const cliente = pedido ? mockClientes.find((c) => c.idCliente === pedido.idCliente) : undefined;
  return new HechoPedido({
    idHecho: index + 1,
    idPedido: detalle.idPedido,
    idCliente: pedido?.idCliente ?? 0,
    idProducto: detalle.idProducto,
    monto: detalle.subtotal,
    cantidad: detalle.cantidad,
    fecha: pedido?.fechaConfirmacion ?? pedido?.fechaCreacion ?? new Date(),
    zona: cliente?.zona ?? "",
    ciudad: cliente?.ciudad ?? "",
    idCompetidorRef: undefined,
  });
});

export const mockCatalogSummary: CatalogSummary = {
  totalProductos: mockProductos.length,
  activos: mockProductos.filter((producto) => producto.activo).length,
  categorias: Array.from(new Set(mockProductos.map((producto) => producto.categoria))).sort(),
};
