export type Moneda = "USD" | "BOB";
export type CanalVenta = "web" | "tienda" | "catalogo" | "whatsapp" | "instagram" | "partner" | "referido";
export type PedidoEstado = "PENDIENTE" | "CONFIRMADO" | "CANCELADO";

type WithAssign<T> = { [K in keyof T]: T[K] };

export class Producto {
  idProducto!: number;
  skuInterno!: string;
  nombre!: string;
  categoria!: string;
  marca!: string;
  anchoCm!: number;
  altoCm!: number;
  caracteristicas!: string[];
  acabados!: string[];
  activo!: boolean;
  fechaCreacion!: Date;
  imageUrl?: string;

  constructor(init: WithAssign<Producto>) {
    Object.assign(this, init);
  }
}

export class PrecioPropio {
  idPrecio!: number;
  idProducto!: number;
  precio!: number;
  moneda!: Moneda;
  fechaInicio!: Date;
  fechaFin?: Date;
  fuente!: "lista_base" | "promo" | "custom";

  constructor(init: WithAssign<PrecioPropio>) {
    Object.assign(this, init);
  }
}

export class Cliente {
  idCliente!: number;
  nombreCompleto!: string;
  email!: string;
  telefono!: string;
  zona!: string;
  ciudad!: string;
  pais!: string;
  canalOrigen!: CanalVenta;
  fechaRegistro!: Date;
  imageUrl?: string;

  constructor(init: WithAssign<Cliente>) {
    Object.assign(this, init);
  }
}

export class Pedido {
  idPedido!: number;
  idCliente!: number;
  canal!: CanalVenta;
  estado!: PedidoEstado;
  montoTotal!: number;
  moneda!: Moneda;
  fechaCreacion!: Date;   
  fechaConfirmacion?: Date;
  urlPdfCotizacion!: string;
  observaciones?: string;

  constructor(init: WithAssign<Pedido>) {
    Object.assign(this, init);
  }
}

export class PedidoDetalle {
  idDetalle!: number;
  idPedido!: number;
  idProducto!: number;
  cantidad!: number;
  precioUnitario!: number;
  precioLista!: number;
  descuentoPorcentaje!: number;
  subtotal!: number;

  constructor(init: WithAssign<PedidoDetalle>) {
    Object.assign(this, init);
  }
}

export class LeadInsight {
  idLead!: number;
  idCliente!: number;
  idPedido?: number;
  comoNosConocio!: string;
  motivoCompraTexto!: string;
  motivoCompraCategoria!: string;
  canalRespuesta!: string;
  urlAudio?: string;
  fechaRegistro!: Date;

  constructor(init: WithAssign<LeadInsight>) {
    Object.assign(this, init);
  }
}

export class PreviewAmbiente {
  idPreview!: number;
  idCliente!: number;
  idProducto!: number;
  urlImagenOriginal!: string;
  urlImagenGenerada!: string;
  fechaCreacion!: Date;

  constructor(init: WithAssign<PreviewAmbiente>) {
    Object.assign(this, init);
  }
}

export class Competidor {
  idCompetidor!: number;
  nombre!: string;
  urlBase!: string;
  metodoExtraccion!: "api" | "scraping_html" | "scraping_spa";
  activo!: boolean;

  constructor(init: WithAssign<Competidor>) {
    Object.assign(this, init);
  }
}

export class PrecioCompetencia {
  idPrecioComp!: number;
  idCompetidor!: number;
  idProducto!: number;
  skuExterno!: string;
  nombreExterno!: string;
  precio!: number;
  moneda!: Moneda;
  urlProducto!: string;
  timestamp!: Date;

  constructor(init: WithAssign<PrecioCompetencia>) {
    Object.assign(this, init);
  }
}

export class HechoPedido {
  idHecho!: number;
  idPedido!: number;
  idCliente!: number;
  idProducto!: number;
  monto!: number;
  cantidad!: number;
  fecha!: Date;
  zona!: string;
  ciudad!: string;
  idCompetidorRef?: number;

  constructor(init: WithAssign<HechoPedido>) {
    Object.assign(this, init);
  }
}

export class DimProducto {
  idProducto!: number;
  skuInterno!: string;
  categoria!: string;
  marca!: string;

  constructor(init: WithAssign<DimProducto>) {
    Object.assign(this, init);
  }
}

export class DimCliente {
  idCliente!: number;
  zona!: string;
  ciudad!: string;
  pais!: string;
  canalOrigen!: CanalVenta;

  constructor(init: WithAssign<DimCliente>) {
    Object.assign(this, init);
  }
}

export class DimTiempo {
  idTiempo!: number;
  fecha!: Date;
  anio!: number;
  mes!: number;
  semana!: number;
  trimestre!: number;

  constructor(init: WithAssign<DimTiempo>) {
    Object.assign(this, init);
  }
}

export class DimZona {
  idZona!: number;
  zona!: string;
  ciudad!: string;
  pais!: string;
  region!: string;

  constructor(init: WithAssign<DimZona>) {
    Object.assign(this, init);
  }
}

export interface CatalogSummary {
  totalProductos: number;
  activos: number;
  categorias: string[];
}
