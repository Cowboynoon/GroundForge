/*
 Copyright 2015 Jo Pol
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program. If not, see http://www.gnu.org/licenses/gpl.html dibl
*/
package dibl

import dibl.Matrix._

import scala.collection.immutable.HashMap
import scala.collection.mutable.ListBuffer

case class PairDiagram private(nodes: Array[HashMap[String,Any]],
                               links: Array[HashMap[String,Any]])

object PairDiagram {

  def apply(): PairDiagram = create(
    set = "2x4",
    abs = Matrix(
      dims = "2x4",
      matrix = "46636668",
      absRows = 12,
      absCols = 12,
      left = 0,
      up = 0).get,
    stitches = ""
  )

  def apply(set: String, nrInSet: Int, absRows: Int, absCols: Int, shiftLeft: Int, shiftUp: Int, stitches: String
           ): PairDiagram = create(
    set = set,
    abs = Matrix(
      key = set,
      index = nrInSet,
      absRows = absRows,
      absCols = absCols,
      left = shiftLeft,
      up = shiftUp).get.get,
    stitches = stitches
  )

  def create(set: String, abs: M, stitches: String): PairDiagram = {
    val (relRows, relCols) = Matrix.dims(set).get
    val nrOfLinks = countLinks(abs)
    val nodeNrs = assignNodeNrs(abs, nrOfLinks)
    val nodes = toNodes(abs, nrOfLinks, relRows, relCols, stitches)
    val links = toLinks(abs, nodeNrs, nodes)
    assignPairNrs(nodes, links)
    PairDiagram(nodes, links)
  }

  private def assignPairNrs(nodes: Array[Props], links: Array[Props]): Unit = {
    // assign numbers to the source node of the first link of each pair
    val startLinks = links.filter(_.getOrElse("start", "").toString.startsWith("pair"))
    for (i <- startLinks.indices) {
      val source = startLinks(i).get("source").get.asInstanceOf[Int]
      nodes(source) = Props("title" -> s"Pair ${i + 1}")
    }
  }

  private def assignNodeNrs(abs: M, nrOfLinks: Array[Array[Int]]
                   ): Array[Array[Int]] = {
    val nodeNrs = Array.fill(abs.length, abs(0).length)(0)
    var nodeNr = 0
    for {row <- nodeNrs.indices
         col <- nodeNrs(0).indices
    } {
      if (nrOfLinks(row)(col) > 0) {
        nodeNrs(row)(col) = nodeNr
        nodeNr += 1
      }
    }
    nodeNrs
  }

  /** Creates nodes for a pair diagram
    *
    * @param m a brick wise stacked version of a predefined matrix
    * @param nrOfLinks nr of links per node alias matrix-cell
    * @param rows dimension of the predefined matrix
    * @param cols dimension of the predefined matrix
    * @return properties per node as in https://github.com/jo-pol/DiBL/blob/gh-pages/tensioned/sample.js
    */
  def toNodes (m: M,
               nrOfLinks: Array[Array[Int]],
               rows: Int,
               cols: Int,
               stitches: String
              ): Array[Props] = {

    def isUsed(row: Int, col: Int): Boolean =
      nrOfLinks(row)(col) > 0

    def isInBottom(row: Int): Boolean =
      row >= m.length - 2

    def isFootside(row: Int, col: Int): Boolean =
      col < 2 || col >= m(0).length - 2

    val bobbin = Props("bobbin" -> true)
    val nodes = ListBuffer[Props]()
    val margin = 2
    val colChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray
    val stitchMap = stitches
      .split("[^a-zA-Z0-9=]+")
      .map(_.split("="))
      .map(a =>
        if (a.length < 2) "A1"->"ctc"
        else a(0) -> a(1)
      ).toMap

    def buildProps(row: Int, col: Int, cell: String): HashMap[String, Any] = {
      if (isInBottom(row)) bobbin
      else if (isFootside(row, col)) Props("title" -> "ttctc")
      else Props(
        "title" -> s"${stitchMap.getOrElse(cell, "ctc")} - $cell"
      )
    }
    for (row <- m.indices) {
      // + margin prevents modulo of a negative number
      val brickOffset = ((row + margin) / rows % 2)  * (cols / 2) + margin
      val cellRow = row % rows + 1
      for (col <- m(0).indices) {
        val cellCol = colChars((brickOffset + col) % cols)
        val cell = s"$cellCol$cellRow"
        if (isUsed(row, col)) nodes += buildProps(row, col, cell)
      }
    }
    nodes.toArray
  }

  /** Creates links for a pair diagram
    *
    * @param m a repeated version of a predefined matrix
    * @param nodeNrs sequence numbers assigned to actually used cells
    * @return properties per link as in https://github.com/jo-pol/DiBL/blob/gh-pages/tensioned/sample.js
    */
  def  toLinks (m: M, nodeNrs: Array[Array[Int]], nodes: Array[Props]
               ): Array[Props] = {

    val links = ListBuffer[Props]()
    connectLoosePairs(m(2).flatten.filter{case (r,c) => isStartOfPair(r,c)})
    for {row <- m.indices
         col <- m(0).indices
         i <- m(row)(col).indices
    } {
      val(srcRow,srcCol) = m(row)(col)(i)
      links += Props(
        "source" -> nodeNrs(srcRow)(srcCol),
        "target" -> nodeNrs(row)(col),
        "start" -> startMarker(srcRow, srcCol),
        "end" -> endMarker(row, col),
        "text" -> midMarker(srcRow, srcCol, row, col, i)
      )
    }

    def connectLoosePairs (sources: Array[(Int,Int)]): Unit = {
      for (i <- 1 until sources.length) {
        val (srcRow,srcCol) = sources(i-1)
        val (row,col) = sources(i)
        links += Props(
          "source" -> nodeNrs(srcRow)(srcCol),
          "target" -> nodeNrs(row)(col),
          "border" -> true
        )
      }
    }

    def startMarker(srcRow: Int, srcCol: Int): String = {
        val srcTitle = getNodeTitle(srcRow, srcCol)
        if (isStartOfPair(srcRow, srcCol)) "pair"
        else if (srcTitle.endsWith("ctctc")) ""
        else if (srcTitle.endsWith("tctc")) "red"
        else if (srcTitle.endsWith("ctc")) "purple"
        else if (srcTitle.endsWith("tc")) "green"
        else if (srcTitle.startsWith("ctctc")) ""
        else if (srcTitle.startsWith("ctct")) "red"
        else if (srcTitle.startsWith("ctc")) "purple"
        else if (srcTitle.startsWith("ct")) "green"
        else ""
      }

    def endMarker(targetRow: Int, targetCol: Int): String = {
      val targetTitle = getNodeTitle(targetRow, targetCol)
      if (isEndOfPair(targetCol)) ""
      else if (targetTitle.endsWith("ctctc")) ""
      else if (targetTitle.endsWith("tctc")) "red"
      else if (targetTitle.endsWith("ctc")) "purple"
      else if (targetTitle.endsWith("tc")) "green"
      else if (targetTitle.startsWith("ctctc")) ""
      else if (targetTitle.startsWith("ctct")) "red"
      else if (targetTitle.startsWith("ctc")) "purple"
      else if (targetTitle.startsWith("ct")) "green"
      else ""
    }

    def midMarker(srcRow: Int, srcCol: Int, targetRow: Int, targetCol: Int, pairNr: Int): Boolean = {
      val targetTitle = getNodeTitle(targetRow, targetCol)
      val sourceTitle = getNodeTitle(srcRow, srcCol)
      targetTitle.startsWith("tt") || sourceTitle.endsWith("tt") ||
      (pairNr == 0 && (targetTitle.startsWith("l")|| sourceTitle.endsWith("r"))) ||
      (pairNr == 1 && (targetTitle.startsWith("r")|| sourceTitle.endsWith("l")))
    }

    def getNodeTitle(row: Int, col: Int): String =
      nodes(nodeNrs(row)(col)).getOrElse("title", "").toString.replaceAll(" .*","")

    def isStartOfPair(srcRow: Int, srcCol: Int): Boolean =
      srcRow < 2 || (srcRow == 2 && (srcCol < 2 || srcCol > m(0).length - 3))

    def isEndOfPair(targetCol: Int): Boolean =
      targetCol > m(0).length - 2

    links.toArray
  }
}